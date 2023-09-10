import { AmocrmSaveDataAdapter } from '@app/amocrm/adapters/amocrm-save-data.adapters';
import { AMOCRM_ERROR_RESPONSE_CODE } from '@app/amocrm/amocrm.constants';
import { AmocrmErrors } from '@app/amocrm/error/amocrm.error';
import { AmocrmGetRequest, AmocrmRequestData } from '@app/amocrm/interfaces/amocrm.interfaces';
import { UtilsService } from '@app/utils/utils.service';
import { HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Client } from 'amocrm-js';
import { ITokenData, IAPIResponse } from 'amocrm-js/dist/interfaces/common';
import { LogService } from '@app/log/log.service';
import { AmocrmV4AuthService } from './amocrm-v4-auth.service';
import { Amocrm, AmocrmDocument } from '@app/amocrm/amocrm.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResponseDataAdapter } from '@app/amocrm/adapters/amocrm-response-data.adapter';

export abstract class AmocrmV4Request {
  constructor(private amocrmModel: Model<AmocrmDocument>) {}

  protected abstract post<T>(url: string, amocrmRequestData: AmocrmRequestData): Promise<IAPIResponse<T>>;
  protected abstract get<T>(url: string, amocrmRequestData: AmocrmGetRequest): Promise<IAPIResponse<T>>;

  public async amocrmPostRequest<T>(url: string, amocrmRequestData: AmocrmRequestData): Promise<IAPIResponse<T>> {
    try {
      const response = await this.post<T>(url, amocrmRequestData);
      await this.saveReqResData(new ResponseDataAdapter(response), amocrmRequestData);
      return response;
    } catch (e) {
      throw e;
    }
  }

  public async amocrmGetRequest<T>(url: string, amocrmRequestData: AmocrmGetRequest): Promise<IAPIResponse<T>> {
    try {
      const response = await this.get<T>(url, amocrmRequestData);
      await this.saveReqResData(new ResponseDataAdapter(response), amocrmRequestData);
      return response;
    } catch (e) {
      throw e;
    }
  }

  private async saveReqResData<T>(response: ResponseDataAdapter<T>, request: AmocrmRequestData | AmocrmGetRequest): Promise<Amocrm> {
    const data = new AmocrmSaveDataAdapter<T>(response, request);
    const amocrm = new this.amocrmModel({ ...data.amocrmData });
    return await amocrm.save();
  }
}

@Injectable()
export class AmocrmV4RequestService extends AmocrmV4Request implements OnApplicationBootstrap {
  private amocrm: Client;
  constructor(
    @InjectModel(Amocrm.name)
    amocrmModel: Model<AmocrmDocument>,
    private readonly log: LogService,
    private readonly amocrmV4AuthService: AmocrmV4AuthService,
  ) {
    super(amocrmModel);
  }

  public async onApplicationBootstrap() {
    this.amocrm = await this.amocrmV4AuthService.initAmocrmClient();
  }

  public async updateToken(token: ITokenData): Promise<void> {
    this.amocrm.token.setValue(token);
  }

  protected async get<T>(url: string, amocrmRequestData: AmocrmGetRequest): Promise<IAPIResponse<T>> {
    return await this._get(url, amocrmRequestData);
  }

  protected async post<T>(url: string, amocrmRequestData: AmocrmRequestData): Promise<IAPIResponse<T>> {
    return await this._post(url, amocrmRequestData);
  }

  private async _get<T>(url: string, amocrmRequestData: AmocrmGetRequest): Promise<IAPIResponse<T>> {
    this.log.info(amocrmRequestData, AmocrmV4RequestService.name);
    const response = await this.amocrm.request.get<T>(url, amocrmRequestData);
    this.log.info(response.data, AmocrmV4RequestService.name);
    this.checkResponse(new ResponseDataAdapter(response));

    return response;
  }

  private async _post<T>(url: string, amocrmRequestData: AmocrmRequestData): Promise<IAPIResponse<T>> {
    this.log.info(amocrmRequestData, AmocrmV4RequestService.name);
    const response = await this.amocrm.request.post<T>(url, [amocrmRequestData]);
    this.log.info(response.data, AmocrmV4RequestService.name);
    this.checkResponse(new ResponseDataAdapter(response));

    return response;
  }

  private checkResponse<T>(response: ResponseDataAdapter<T>): void {
    if (!!response.statusCode && [HttpStatus.BAD_REQUEST].includes(response.statusCode)) {
      if (!AmocrmErrors.isNormalBadRequestError<T>(response)) throw UtilsService.dataToString(response.data);
    }
    if (!!response.statusCode && AMOCRM_ERROR_RESPONSE_CODE.includes(response.statusCode)) {
      throw UtilsService.dataToString(response);
    }
  }
}
