import { HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AmocrmConnector, AmocrmV2Auth } from './amocrm.connect';
import {
  AmocrmAddCallInfo,
  AmocrmAddCallInfoResponse,
  AmocrmAddTasks,
  AmocrmCreateContact,
  AmocrmCreateContactResponse,
  AmocrmCreateLead,
  AmocrmCreateLeadResponse,
  AmocrmCreateTasksResponse,
  AmocrmGetContactsRequest,
  AmocrmGetContactsResponse,
  SendCallInfoToCRM,
} from './interfaces/amocrm.interfaces';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '@app/redis/redis.service';
import { LogService } from '@app/log/log.service';
import { NumberInfo, System } from '@app/system/system.schema';
import { Amocrm, AmocrmDocument } from './amocrm.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AmocrmAPI,
  AmoCRMAPIV2,
  CreatedById,
  CustomFieldsValuesEnumId,
  CustomFieldsValuesId,
  ResponsibleUserId,
  TaskTypeId,
} from './interfaces/amocrm.enum';
import { AMOCRM_ERROR_RESPONSE_CODE, CALL_STATUS_MAP, DEFAULT_TASKS_TEXT, RECORD_PATH_FROMAT } from './amocrm.constants';
import { Client } from 'amocrm-js';
import { UtilsService } from '@app/utils/utils.service';
import { AmocrmSaveDataAdapter, ResponseDataAdapter } from './amocrm.adapters';
import { AmocrmErrors } from './amocrm.error';

@Injectable()
export class AmocrmV4Service implements OnApplicationBootstrap {
  public amocrm: Client;
  private readonly recordDomain = this.configService.get('amocrm.recordDomain');
  private readonly recordLink: string = `${this.recordDomain}/rec/monitor/${moment().format(RECORD_PATH_FROMAT)}/`;

  constructor(
    @InjectModel(Amocrm.name)
    private amocrmModel: Model<AmocrmDocument>,
    private readonly amocrmConnect: AmocrmConnector,
    private readonly log: LogService,
    private readonly configService: ConfigService,
    private redis: RedisService,
  ) {}

  public async onApplicationBootstrap() {
    this.amocrm = await this.getAmocrmClient();
  }

  public async actionsInAmocrm(incomingNumber: string, incomingTrunk: string): Promise<void> {
    try {
      const resultSearchContact = await this.searchContact(incomingNumber);
      if (resultSearchContact == false) {
        const idCreateContact = await this.createContact(incomingNumber, incomingTrunk);
        await this.createLeads(incomingNumber, incomingTrunk, idCreateContact);
        //await this.createTask(resultCreateLead._embedded.leads[0].id); Отключили так как клиент переходит на Sensay
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
        text: DEFAULT_TASKS_TEXT,
        task_type_id: TaskTypeId.NewLead,
        complete_till: moment().unix(),
      };
      this.log.info(tasksInfo, AmocrmV4Service.name);
      const apiResponse = await this.amocrm.request.post(AmocrmAPI.tasks, [tasksInfo]);
      const response = new ResponseDataAdapter(apiResponse);
      return await this.getDataAndSave<AmocrmCreateTasksResponse>(response, new AmocrmSaveDataAdapter(response, tasksInfo));
    } catch (e) {
      throw e;
    }
  }

  public async sendCallInfoToCRM(data: SendCallInfoToCRM): Promise<AmocrmAddCallInfoResponse> {
    try {
      const { result, direction, amocrmId, cdrId } = data;
      const { uniqueid, src, dst, calldate, billsec, disposition, recordingfile } = result;
      const date = moment(calldate).subtract(3, 'hour').unix();

      const callInfo: AmocrmAddCallInfo = {
        direction: direction,
        uniq: uniqueid,
        duration: billsec,
        source: 'amo_custom_widget',
        link: `${this.recordLink}${recordingfile}`,
        phone: src !== undefined ? src : dst,
        call_result: '',
        call_status: CALL_STATUS_MAP[disposition],
        responsible_user_id: amocrmId,
        created_by: amocrmId,
        updated_by: amocrmId,
        created_at: date,
        updated_at: date,
      };

      this.log.info(callInfo, AmocrmV4Service.name);
      const apiResponse = await this.amocrm.request.post(AmocrmAPI.call, [callInfo]);
      this.log.info(apiResponse.data, AmocrmV4Service.name);
      const response = new ResponseDataAdapter(apiResponse);
      return await this.getDataAndSave<AmocrmAddCallInfoResponse>(response, new AmocrmSaveDataAdapter(response, callInfo, result, cdrId));
    } catch (e) {
      throw e;
    }
  }

  public async searchContact(incomingNumber: string): Promise<boolean> {
    try {
      const info: AmocrmGetContactsRequest = {
        query: UtilsService.formatIncomingNumber(incomingNumber),
      };
      const result = (await this.amocrm.request.get<AmocrmGetContactsResponse>(AmocrmAPI.contacts, info))?.data;
      this.log.info(`Результат поиска контакта ${incomingNumber}: ${JSON.stringify(result)}`, AmocrmV4Service.name);
      return !!result?._embedded ? true : false;
    } catch (e) {
      throw `${e}: ${incomingNumber}`;
    }
  }

  private async createContact(incomingNumber: string, incomingTrunk: string): Promise<number> {
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
      this.log.info(contact, AmocrmV4Service.name);
      const apiResponse = await this.amocrm.request.post(AmocrmAPI.contacts, [contact]);
      const response = new ResponseDataAdapter(apiResponse);
      const data = await this.getDataAndSave<AmocrmCreateContactResponse>(response, new AmocrmSaveDataAdapter(response, contact));
      return data._embedded.contacts[0].id;
    } catch (e) {
      throw `${e}: ${incomingNumber} ${incomingTrunk}`;
    }
  }

  private async createLeads(incomingNumber: string, incomingTrunk: string, contactsId: number): Promise<AmocrmCreateLeadResponse> {
    try {
      const numberConfig = await this.getIncomingNumberConfig(incomingTrunk);
      const lead: AmocrmCreateLead = {
        name: numberConfig.createLead.description,
        responsible_user_id: ResponsibleUserId.AdminCC,
        created_by: CreatedById.AdminCC,
        ...(numberConfig.createLead.pipelineId.length > 0 ? { pipeline_id: Number(numberConfig.createLead.pipelineId) } : {}),
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

      this.log.info(lead, AmocrmV4Service.name);
      const apiResponse = await this.amocrm.request.post(AmocrmAPI.leads, [lead]);
      const response = new ResponseDataAdapter(apiResponse);
      return await this.getDataAndSave<AmocrmCreateLeadResponse>(response, new AmocrmSaveDataAdapter(response, lead));
    } catch (e) {
      throw `${e}: ${incomingNumber} ${incomingTrunk} ${contactsId}`;
    }
  }

  private async getDataAndSave<T>(response: ResponseDataAdapter, data: AmocrmSaveDataAdapter): Promise<T> {
    await this.saveData(data);
    if (!!response.statusCode && [HttpStatus.BAD_REQUEST].includes(response.statusCode)) {
      if (!AmocrmErrors.isNormalBadRequestError(response)) throw UtilsService.dataToString(response.data);
    }
    if (!!response.statusCode && AMOCRM_ERROR_RESPONSE_CODE.includes(response.statusCode)) {
      throw UtilsService.dataToString(response.data);
    }
    return response.data as T;
  }

  private async getIncomingNumberConfig(incominNumber: string) {
    try {
      const config = await this.redis.getCustomKey('config');
      const configJson = JSON.parse(config) as System;
      return configJson.numbersInfo.find((numberInfo: NumberInfo) => numberInfo.trunkNumber === incominNumber);
    } catch (e) {
      throw e;
    }
  }

  private async getAmocrmClient(): Promise<Client> {
    return await this.amocrmConnect.getAmocrmClient();
  }

  private async saveData(data: AmocrmSaveDataAdapter) {
    const amocrm = new this.amocrmModel({ ...data.amocrmData });
    return await amocrm.save();
  }
}

@Injectable()
export class AmocrmV2Service {
  constructor(private readonly amocrm: AmocrmV2Auth, private readonly log: LogService, private httpService: HttpService) {}

  public async incomingCallEvent(incomingNumber: string, eventResponsibleUserId: string): Promise<boolean> {
    try {
      await this.amocrm.auth();
      const result = await this.httpService
        .post(`${this.amocrm.amocrmApiV2Domain}${AmoCRMAPIV2.events}`, this.getEventsData(incomingNumber, eventResponsibleUserId), {
          headers: { Cookie: this.amocrm.authCookies },
        })
        .toPromise();
      return !!result.data;
    } catch (e) {
      this.log.error(e, AmocrmV2Service.name);
      throw e;
    }
  }

  private getEventsData(incomingNumber: string, eventResponsibleUserId: string): string {
    const eventsData = JSON.stringify({
      add: [
        {
          type: 'phone_call',
          phone_number: UtilsService.formatIncomingNumber(incomingNumber),
          users: [`"${eventResponsibleUserId}"`],
        },
      ],
    });
    this.log.info(eventsData, AmocrmV2Service.name);
    return eventsData;
  }
}
