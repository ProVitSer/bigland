import { HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AmocrmV4Connector } from './amocrm-v4.connect';
import {
  AmocrmAddCallInfoResponse,
  AmocrmCreateContactResponse,
  AmocrmCreateLeadResponse,
  AmocrmCreateTasksResponse,
  AmocrmGetContactsRequest,
  AmocrmGetContactsResponse,
  AmocrmRequestData,
  AmocrmSaveData,
  SendCallInfoToCRM,
} from '../interfaces/amocrm.interfaces';
import { ConfigService } from '@nestjs/config';
import { LogService } from '@app/log/log.service';
import { Amocrm, AmocrmDocument } from '../amocrm.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmocrmAPIV4 } from '../interfaces/amocrm.enum';
import { AMOCRM_ERROR_RESPONSE_CODE } from '../amocrm.constants';
import { Client } from 'amocrm-js';
import { UtilsService } from '@app/utils/utils.service';
import { AmocrmSaveDataAdapter, ResponseDataAdapter } from '../amocrm.adapters';
import { AmocrmErrors } from '../amocrm.error';
import { SystemService } from '@app/system/system.service';
import { NumberInfo } from '@app/system/system.schema';
import { IAPIResponse } from 'amocrm-js/dist/interfaces/common';
import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import {
  AmocrmCallDataAdapter,
  AmocrmCreateContactDataAdapter,
  AmocrmCreateLeadDataAdapter,
  AmocrmCreateTaskDataAdapter,
} from '../adapters';

@Injectable()
export class AmocrmV4Service implements OnApplicationBootstrap {
  public amocrm: Client;
  private readonly recordDomain = this.configService.get('amocrm.recordDomain');
  private readonly recordPath = this.configService.get('asterisk.recordPath');
  private readonly recordUrl = `${this.recordDomain}${this.recordPath}`;

  constructor(
    @InjectModel(Amocrm.name)
    private amocrmModel: Model<AmocrmDocument>,
    private readonly amocrmConnect: AmocrmV4Connector,
    private readonly log: LogService,
    private readonly configService: ConfigService,
    private system: SystemService,
    private readonly amocrmUsersService: AmocrmUsersService,
  ) {}

  public async onApplicationBootstrap() {
    this.amocrm = await this.getAmocrmClient();
  }

  public async actionsInAmocrm(incomingNumber: string, incomingTrunk: string): Promise<void> {
    try {
      if (!(await this.searchContact(incomingNumber))) {
        const numberConfig = await this.getIncomingNumberConfig(incomingTrunk);
        const createContactData = await this.createContact(new AmocrmCreateContactDataAdapter(incomingNumber, numberConfig));
        await this.createLeads(new AmocrmCreateLeadDataAdapter(incomingNumber, numberConfig, createContactData));
      }
    } catch (e) {
      throw e;
    }
  }

  public async createTask(entityLeadId: number): Promise<AmocrmCreateTasksResponse> {
    try {
      const dataAdapter = new AmocrmCreateTaskDataAdapter(entityLeadId);
      const response = await this.sendRequest<AmocrmCreateTasksResponse>(AmocrmAPIV4.contacts, dataAdapter.amocrmRequestData);
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async sendCallInfoToCRM(data: SendCallInfoToCRM): Promise<AmocrmAddCallInfoResponse> {
    try {
      const amocrmUsers = await this.amocrmUsersService.getAmocrmUsers();
      const dataDatapter = new AmocrmCallDataAdapter(data, amocrmUsers, this.recordUrl);
      const response = await this.sendRequest<AmocrmAddCallInfoResponse>(AmocrmAPIV4.call, dataDatapter.amocrmRequestData, {
        cdrData: data.asteriskCdrInfo,
        cdrId: data.msg._id,
      });
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async searchContact(incomingNumber: string): Promise<boolean> {
    try {
      const getContactsInfo: AmocrmGetContactsRequest = {
        query: UtilsService.formatIncomingNumber(incomingNumber),
      };

      const result = (await this.amocrm.request.get<AmocrmGetContactsResponse>(AmocrmAPIV4.contacts, getContactsInfo))?.data;
      this.log.info(`Результат поиска контакта ${incomingNumber}: ${JSON.stringify(result)}`, AmocrmV4Service.name);

      return !!result?._embedded;
    } catch (e) {
      throw `${e}: ${incomingNumber}`;
    }
  }

  private async createContact(dataAdapter: AmocrmCreateContactDataAdapter): Promise<AmocrmCreateContactResponse> {
    try {
      const response = await this.sendRequest<AmocrmCreateContactResponse>(AmocrmAPIV4.contacts, dataAdapter.amocrmRequestData);
      return response.data;
    } catch (e) {
      throw `${e}: ${dataAdapter.incomingNumber}`;
    }
  }

  private async createLeads(dataAdapter: AmocrmCreateLeadDataAdapter): Promise<AmocrmCreateLeadResponse> {
    try {
      const response = await this.sendRequest<AmocrmCreateLeadResponse>(AmocrmAPIV4.leads, dataAdapter.amocrmRequestData);
      return response.data;
    } catch (e) {
      throw `${e}: ${dataAdapter.incomingNumber} ${dataAdapter.incomingTrunk} ${dataAdapter.contactsId}`;
    }
  }

  private async sendRequest<T>(url: string, amocrmRequestData: AmocrmRequestData, saveFields?: any): Promise<IAPIResponse<T>> {
    this.log.info(amocrmRequestData, AmocrmV4Service.name);
    const response = await this.amocrm.request.post<T>(url, [amocrmRequestData]);
    this.log.info(response.data, AmocrmV4Service.name);

    await this.saveResponse<T>(new ResponseDataAdapter(response), { amocrmRequestData, ...saveFields });
    this.checkResponse(new ResponseDataAdapter(response));

    return response as IAPIResponse<T>;
  }

  private async saveResponse<T>(response: ResponseDataAdapter<T>, saveData: AmocrmSaveData): Promise<Amocrm> {
    const data = new AmocrmSaveDataAdapter<T>(response, saveData);
    const amocrm = new this.amocrmModel({ ...data.amocrmData });
    return await amocrm.save();
  }

  private checkResponse<T>(response: ResponseDataAdapter<T>): void {
    if (!!response.statusCode && [HttpStatus.BAD_REQUEST].includes(response.statusCode)) {
      if (!AmocrmErrors.isNormalBadRequestError<T>(response)) throw UtilsService.dataToString(response.data);
    }
    if (!!response.statusCode && AMOCRM_ERROR_RESPONSE_CODE.includes(response.statusCode)) {
      throw UtilsService.dataToString(response);
    }
  }

  private async getIncomingNumberConfig(incominNumber: string): Promise<NumberInfo | undefined> {
    try {
      const config = await this.system.getConfig();
      return config.numbersInfo.find((numberInfo: NumberInfo) => numberInfo.trunkNumber === incominNumber);
    } catch (e) {
      throw e;
    }
  }

  private async getAmocrmClient(): Promise<Client> {
    return await this.amocrmConnect.initAmocrmClient();
  }
}
