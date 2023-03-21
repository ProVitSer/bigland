import { HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AmocrmV4Connector } from './amocrm-v4.connect';
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
  AmocrmRequestData,
  AmocrmSaveData,
  SendCallInfoToCRM,
} from '../interfaces/amocrm.interfaces';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { LogService } from '@app/log/log.service';
import { Amocrm, AmocrmDocument } from '../amocrm.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AmocrmAPIV4,
  ApplicationStage,
  CreatedById,
  CustomFieldsValuesEnumId,
  CustomFieldsValuesId,
  ResponsibleUserId,
  TaskTypeId,
} from '../interfaces/amocrm.enum';
import {
  AMOCRM_ERROR_RESPONSE_CODE,
  CALL_DATE_SUBTRACT,
  CALL_STATUS_MAP,
  DEFAULT_NUMBER,
  DEFAULT_TASKS_TEXT,
  RECORD_PATH_FROMAT,
} from '../amocrm.constants';
import { Client } from 'amocrm-js';
import { UtilsService } from '@app/utils/utils.service';
import { AmocrmSaveDataAdapter, ResponseDataAdapter } from '../amocrm.adapters';
import { AmocrmErrors } from '../amocrm.error';
import { SystemService } from '@app/system/system.service';
import { NumberInfo } from '@app/system/system.schema';
import { IAPIResponse } from 'amocrm-js/dist/interfaces/common';

@Injectable()
export class AmocrmV4Service implements OnApplicationBootstrap {
  public amocrm: Client;
  private readonly recordDomain = this.configService.get('amocrm.recordDomain');

  constructor(
    @InjectModel(Amocrm.name)
    private amocrmModel: Model<AmocrmDocument>,
    private readonly amocrmConnect: AmocrmV4Connector,
    private readonly log: LogService,
    private readonly configService: ConfigService,
    private system: SystemService,
  ) {}

  public async onApplicationBootstrap() {
    this.amocrm = await this.getAmocrmClient();
  }

  public async actionsInAmocrm(incomingNumber: string, incomingTrunk: string): Promise<void> {
    try {
      if (await this.searchContact(incomingNumber)) {
        const idCreateContact = await this.createContact(incomingNumber, incomingTrunk);
        await this.createLeads(incomingNumber, incomingTrunk, idCreateContact);
      }
    } catch (e) {
      throw e;
    }
  }

  public async createTask(entitleadId: number): Promise<AmocrmCreateTasksResponse> {
    try {
      const amocrmRequestData: AmocrmAddTasks = {
        responsible_user_id: ResponsibleUserId.AdminCC,
        entity_id: entitleadId,
        entity_type: 'leads',
        text: DEFAULT_TASKS_TEXT,
        task_type_id: TaskTypeId.NewLead,
        complete_till: moment().unix(),
      };

      const response = await this.sendRequest<AmocrmCreateTasksResponse>(AmocrmAPIV4.contacts, amocrmRequestData);
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async sendCallInfoToCRM(data: SendCallInfoToCRM): Promise<AmocrmAddCallInfoResponse> {
    try {
      const { result, direction, amocrmId, cdrId } = data;
      const { uniqueid, src, dst, calldate, billsec, disposition, recordingfile } = result;
      const date = moment(calldate).subtract(CALL_DATE_SUBTRACT, 'hour').unix();

      const amocrmRequestData: AmocrmAddCallInfo = {
        direction: direction,
        uniq: uniqueid,
        duration: billsec,
        source: 'amo_custom_widget',
        link: `${this.recordDomain}/rec/monitor/${moment(calldate)
          .subtract(CALL_DATE_SUBTRACT, 'hour')
          .format(RECORD_PATH_FROMAT)}/${recordingfile}`,
        phone: src !== undefined ? src : dst,
        call_result: '',
        call_status: CALL_STATUS_MAP[disposition],
        responsible_user_id: amocrmId,
        created_by: amocrmId,
        updated_by: amocrmId,
        created_at: date,
        updated_at: date,
      };

      const response = await this.sendRequest<AmocrmAddCallInfoResponse>(AmocrmAPIV4.call, amocrmRequestData, { cdrData: result, cdrId });
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

  private async createContact(incomingNumber: string, incomingTrunk: string): Promise<number> {
    try {
      const numberConfig = await this.getIncomingNumberConfig(incomingTrunk);

      const amocrmRequestData: AmocrmCreateContact = {
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
                value: numberConfig?.originNumber || DEFAULT_NUMBER,
              },
            ],
          },
        ],
      };

      const response = await this.sendRequest<AmocrmCreateContactResponse>(AmocrmAPIV4.contacts, amocrmRequestData);
      return response.data._embedded.contacts[0].id;
    } catch (e) {
      throw `${e}: ${incomingNumber} ${incomingTrunk}`;
    }
  }

  private async createLeads(incomingNumber: string, incomingTrunk: string, contactsId: number): Promise<AmocrmCreateLeadResponse> {
    try {
      const numberConfig = await this.getIncomingNumberConfig(incomingTrunk);

      const amocrmRequestData: AmocrmCreateLead = {
        responsible_user_id: ResponsibleUserId.AdminCC,
        created_by: CreatedById.AdminCC,
        ...this.createLeadStruct(numberConfig, incomingNumber),
        _embedded: {
          contacts: [
            {
              id: contactsId,
            },
          ],
        },
      };

      const response = await this.sendRequest<AmocrmCreateLeadResponse>(AmocrmAPIV4.leads, amocrmRequestData);
      return response.data;
    } catch (e) {
      throw `${e}: ${incomingNumber} ${incomingTrunk} ${contactsId}`;
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
      if (!AmocrmErrors.isNormalBadRequestError(response)) throw UtilsService.dataToString(response.data);
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
    return await this.amocrmConnect.getAmocrmClient();
  }

  private createLeadStruct(numberConfig: NumberInfo | undefined, incomingNumber: string) {
    if (!!numberConfig) {
      return {
        name: numberConfig.createLead.description,
        ...(numberConfig.createLead.pipelineId.length > 0 ? { pipeline_id: Number(numberConfig.createLead.pipelineId) } : {}),
        status_id: Number(numberConfig.createLead.statusId),
        custom_fields_values: numberConfig.createLead.customFieldsValues,
      };
    } else {
      return {
        name: 'MG_CALL',
        status_id: ApplicationStage.DozvonCC,
        custom_fields_values: [
          {
            field_id: CustomFieldsValuesId.LeadsLgTel,
            field_name: 'LG Tel',
            values: [
              {
                value: incomingNumber,
              },
            ],
          },
          {
            field_id: CustomFieldsValuesId.TypeRequest,
            field_name: 'Тип Запроса',
            values: [
              {
                value: 'CALL',
              },
            ],
          },
        ],
      };
    }
  }
}
