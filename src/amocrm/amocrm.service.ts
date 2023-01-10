import { HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AmocrmConnector } from './amocrm.connect';
import {
  AmocrmAddCallInfo,
  AmocrmAddTasks,
  amocrmAPI,
  AmocrmCreateContact,
  AmocrmCreateContactResponse,
  AmocrmCreateLead,
  AmocrmCreateLeadResponse,
  AmocrmCreateTasksResponse,
  AmocrmGetContactsRequest,
  AmocrmGetContactsResponse,
  SendCallInfoToCRM,
} from './interfaces/amocrm.interfaces';
import {
  AmoCRMAPIV2,
  callStatuskMap,
  CreatedById,
  CustomFieldsValuesEnumId,
  CustomFieldsValuesId,
  DefaultTasksText,
  RecordPathFormat,
  ResponsibleUserId,
  TaskTypeId,
} from './amocrm.config';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AmocrmUtilsService } from './amocrm.utils';
import { RedisService } from '@app/redis/redis.service';
import { LogService } from '@app/log/log.service';
import { NumberInfo, System } from '@app/system/system.schema';
import { Amocrm, AmocrmDocument } from './amocrm.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AmocrmService implements OnApplicationBootstrap {
  public amocrm: any;
  private readonly recordDomain = this.configService.get('amocrm.recordDomain');
  private readonly amocrmApiV2Domain = this.configService.get(
    'amocrm.v2.apiV2Domain',
  );
  private authCookies: string[];
  private headers = {
    'User-Agent': this.configService.get('amocrm.v2.userAgent'),
    'Content-Type': this.configService.get('amocrm.v2.contentType'),
  };

  constructor(
    @InjectModel(Amocrm.name)
    private amocrmModel: Model<AmocrmDocument>,
    private readonly amocrmConnect: AmocrmConnector,
    private readonly log: LogService,
    private readonly configService: ConfigService,
    private httpService: HttpService,
    private redis: RedisService,
  ) {}

  public async onApplicationBootstrap() {
    this.amocrm = await this.connect();
  }

  public async actionsInAmocrm(
    incomingNumber: string,
    incomingTrunk: string,
  ): Promise<void> {
    try {
      const resultSearchContact = await this.searchContact(incomingNumber);
      if (resultSearchContact == false) {
        const idCreateContact = await this.createContact(
          incomingNumber,
          incomingTrunk,
        );
        const resultCreateLead = await this.createLeads(
          incomingNumber,
          incomingTrunk,
          idCreateContact,
        );
        await this.createTask(resultCreateLead._embedded.leads[0].id);
      }
    } catch (e) {
      throw e;
    }
  }

  public async createTask(entitleadId: number) {
    try {
      const tasksInfo: AmocrmAddTasks = {
        responsible_user_id: ResponsibleUserId.AdminCC,
        entity_id: entitleadId,
        entity_type: 'leads',
        text: DefaultTasksText,
        task_type_id: TaskTypeId.NewLead,
        complete_till: moment().unix(),
      };
      this.log.info(tasksInfo, AmocrmService.name);
      const response = await this.amocrm.request.post(amocrmAPI.tasks, [
        tasksInfo,
      ]);
      this.log.info(response.data, AmocrmService.name);
      return await this.checkResponseData<AmocrmCreateTasksResponse>(response);
    } catch (e) {
      throw e;
    }
  }

  public async sendCallInfoToCRM(data: SendCallInfoToCRM): Promise<any> {
    //AmocrmAddCallInfoResponse
    try {
      const { result, direction, amocrmId, cdrId } = data;
      const {
        uniqueid,
        src,
        dst,
        calldate,
        billsec,
        disposition,
        recordingfile,
      } = result;
      const date = moment(calldate).subtract(3, 'hour').unix();

      const callInfo: AmocrmAddCallInfo = {
        direction: direction,
        uniq: uniqueid,
        duration: billsec,
        source: 'amo_custom_widget',
        link: `${this.recordDomain}/rec/monitor/${moment().format(
          RecordPathFormat,
        )}/${recordingfile}`,
        phone: src !== undefined ? src : dst,
        call_result: '',
        call_status: callStatuskMap[disposition],
        responsible_user_id: amocrmId,
        created_by: amocrmId,
        updated_by: amocrmId,
        created_at: date,
        updated_at: date,
      };

      this.log.info(callInfo, AmocrmService.name);
      // const response = await this.amocrm.request.post(amocrmAPI.call, [
      //   callInfo,
      // ]);
      // this.log.info(response.data, AmocrmService.name);
      // return await this.checkResponseData<AmocrmAddCallInfoResponse>(response, cdrId);
    } catch (e) {
      throw e;
    }
  }

  public async searchContact(incomingNumber: string): Promise<boolean> {
    try {
      const info: AmocrmGetContactsRequest = {
        query: AmocrmUtilsService.formatIncomingNumber(incomingNumber),
      };
      const result: AmocrmGetContactsResponse = (
        await this.amocrm.request.get(amocrmAPI.contacts, info)
      )?.data;
      this.log.info(
        `Результат поиска контакта ${incomingNumber}: ${JSON.stringify(
          result,
        )}`,
        AmocrmService.name,
      );
      return !!result ? true : false;
    } catch (e) {
      throw `${e}: ${incomingNumber}`;
    }
  }

  private async createContact(
    incomingNumber: string,
    incomingTrunk: string,
  ): Promise<number> {
    try {
      const numberConfig = await this.getIncomingNumberConfig(incomingTrunk);
      const contact: AmocrmCreateContact = {
        name: `Новый клиент ${incomingNumber}`,
        responsible_user_id: ResponsibleUserId.AdminCC,
        created_by: CreatedById.AdminCC,
        custom_fields_values: [
          {
            field_id: CustomFieldsValuesId.ContactsPhone,
            field_name: 'Телефон',
            field_code: 'PHONE',
            values: [
              {
                value: incomingNumber,
                enum_id: CustomFieldsValuesEnumId.Number,
                enum_code: 'MOB',
              },
            ],
          },
          {
            field_id: CustomFieldsValuesId.ContactsLgTel,
            field_name: 'LG Tel',
            field_code: null,
            values: [
              {
                value: numberConfig.originNumber,
              },
            ],
          },
        ],
      };
      this.log.info(contact, AmocrmService.name);
      const response = await this.amocrm.request.post(amocrmAPI.contacts, [
        contact,
      ]);
      const data = await this.checkResponseData<AmocrmCreateContactResponse>(
        response,
      );
      return data._embedded.contacts[0].id;
    } catch (e) {
      throw `${e}: ${incomingNumber} ${incomingTrunk}`;
    }
  }

  private async createLeads(
    incomingNumber: string,
    incomingTrunk: string,
    contactsId: number,
  ): Promise<AmocrmCreateLeadResponse> {
    try {
      const numberConfig = await this.getIncomingNumberConfig(incomingTrunk);

      const lead: AmocrmCreateLead = {
        name: numberConfig.createLead.description,
        responsible_user_id: ResponsibleUserId.AdminCC,
        created_by: CreatedById.AdminCC,
        pipeline_id: Number(numberConfig.createLead.pipelineId),
        status_id: Number(numberConfig.createLead.statusId),
        custom_fields_values: numberConfig.createLead.customFieldsValues,
        _embedded: {
          contacts: [
            {
              id: contactsId,
            },
          ],
        },
      };

      this.log.info(lead, AmocrmService.name);
      const response = await this.amocrm.request.post(amocrmAPI.leads, [lead]);
      return await this.checkResponseData<AmocrmCreateLeadResponse>(response);
    } catch (e) {
      throw `${e}: ${incomingNumber} ${incomingTrunk} ${contactsId}`;
    }
  }

  public async incomingCallEvent(
    incomingNumber: string,
    eventResponsibleUserId: string,
  ): Promise<boolean> {
    try {
      await this.auth();
      const body = JSON.stringify({
        add: [
          {
            type: 'phone_call',
            phone_number:
              AmocrmUtilsService.formatIncomingNumber(incomingNumber),
            users: [`"${eventResponsibleUserId}"`],
          },
        ],
      });
      this.log.info(body, AmocrmService.name);
      this.headers['Cookie'] = this.authCookies;

      const result = await this.httpService
        .post(`${this.amocrmApiV2Domain}${AmoCRMAPIV2.events}`, body, {
          headers: this.headers,
        })
        .toPromise();
      return !!result.data;
    } catch (e) {
      this.log.error(e, AmocrmService.name);
      throw e;
    }
  }

  private async auth() {
    try {
      const isAuth = await this.checkAuth();
      if (isAuth) {
        return;
      } else {
        return await this.authAmocrm();
      }
    } catch (e) {
      throw e;
    }
  }

  private async checkAuth(): Promise<boolean> {
    try {
      const result = await this.httpService
        .get(`${this.amocrmApiV2Domain}${AmoCRMAPIV2.account}`)
        .toPromise();
      return !!result.data.name;
    } catch (e) {
      throw e;
    }
  }

  private async authAmocrm(): Promise<void> {
    try {
      const body = {
        USER_LOGIN: this.configService.get('amocrm.v2.login'),
        USER_HASH: this.configService.get('amocrm.v2.hash'),
      };
      const result = await this.httpService
        .post(`${this.amocrmApiV2Domain}${AmoCRMAPIV2.auth}`, body)
        .toPromise();
      if (
        !!result.status &&
        !!result.headers['set-cookie'] &&
        result.status == HttpStatus.OK
      ) {
        this.authCookies = result.headers['set-cookie'];
      } else {
        throw String(result);
      }
      return;
    } catch (e) {
      throw e;
    }
  }

  private async checkResponseData<T>(response: any, cdrId?: any): Promise<T> {
    await this.saveResponse(response, cdrId);
    if (!!response.status && [400, 401].includes(response.status)) {
      throw String(response.data);
    } else {
      return response.data as T;
    }
  }

  private async getIncomingNumberConfig(incominNumber: string) {
    try {
      const config = await this.redis.getCustomKey('config');
      const configJson = JSON.parse(config) as System;
      return configJson.numbersInfo.find(
        (numberInfo: NumberInfo) => numberInfo.trunkNumber === incominNumber,
      );
    } catch (e) {
      throw e;
    }
  }

  private async connect(): Promise<AmocrmConnector> {
    return await this.amocrmConnect.connect();
  }

  private async saveResponse(response: any, cdrCollId: any) {
    const cdrId = !!cdrCollId ? cdrCollId : {};
    const amocrm = new this.amocrmModel({
      cdrId,
      statusCode: response.status || 0,
      amocrmResponse: response.data || '',
    });
    return await amocrm.save();
  }
}
