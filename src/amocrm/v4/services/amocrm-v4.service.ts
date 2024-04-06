import { Injectable } from '@nestjs/common';
import {
  AmocrmAddCallInfoResponse,
  AmocrmCreateContactResponse,
  AmocrmCreateLeadResponse,
  AmocrmGetRequest,
  AmocrmGetContactsResponse,
  SendCallInfoToCRM,
} from '../../interfaces/amocrm.interfaces';
import { ConfigService } from '@nestjs/config';
import { LogService } from '@app/log/log.service';
import { UtilsService } from '@app/utils/utils.service';
import { SystemService } from '@app/system/system.service';
import { NumberInfo } from '@app/system/system.schema';
import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { AmocrmCallDataAdapter, AmocrmCreateContactDataAdapter, AmocrmCreateLeadDataAdapter } from '../../adapters';
import { AmocrmV4ApiService } from './amocrm-v4-api.service';
import { CallData } from '@app/asterisk/ari/interfaces/ari.interfaces';
import { AmocrmEnvironmentVariables, AsteriskEnvironmentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class AmocrmV4Service {
    private amocrmConfig = this.configService.get < AmocrmEnvironmentVariables > ('amocrm');
    private asteriskConfig = this.configService.get < AsteriskEnvironmentVariables > ('asterisk');
    private readonly recordUrl = `${this.amocrmConfig.recordDomain}${this.asteriskConfig.recordPath}`;

    constructor(
        private readonly log: LogService,
        private readonly configService: ConfigService,
        private readonly system: SystemService,
        private readonly amocrmV4ApiService: AmocrmV4ApiService,
        private readonly amocrmUsersService: AmocrmUsersService,
    ) {}

    public async actionsInAmocrm(callData: CallData): Promise<void> {
        try {

            const numberConfig = await this.getIncomingNumberConfig(callData.exten);

            const createContactData = await this.createContact(new AmocrmCreateContactDataAdapter({
                callData,
                numberConfig
            }));

            await this.createLeads(new AmocrmCreateLeadDataAdapter({
                callData,
                numberConfig,
                createContactData
            }));

        } catch (e) {

            throw e;

        }
    }

    public async sendCallInfoToCRM(data: SendCallInfoToCRM): Promise<AmocrmAddCallInfoResponse> {
        try {

            const amocrmUsers = await this.amocrmUsersService.getAmocrmUsers();

            const dataDatapter = new AmocrmCallDataAdapter(data, amocrmUsers, this.recordUrl);

            const response = await this.amocrmV4ApiService.sendCallInfo<AmocrmAddCallInfoResponse>(dataDatapter.amocrmRequestData);

            return response.data;

        } catch (e) {

            throw e;

        }
    }

    public async getContactByNumber(incomingNumber: string): Promise<AmocrmGetContactsResponse> {
        try {

            const getContactsInfo: AmocrmGetRequest = {
                query: UtilsService.formatIncomingNumber(incomingNumber),
            };

            const response = await this.amocrmV4ApiService.searchContact < AmocrmGetContactsResponse > (getContactsInfo);

            this.log.info(`Результат поиска контакта ${incomingNumber}: ${JSON.stringify(response.data)}`, AmocrmV4Service.name);

            return response.data;

        } catch (e) {

            throw `${e}: ${incomingNumber}`;

        }
    }

    private async createContact(dataAdapter: AmocrmCreateContactDataAdapter): Promise<AmocrmCreateContactResponse> {
        try {

            const response = await this.amocrmV4ApiService.createContact < AmocrmCreateContactResponse > (dataAdapter.amocrmRequestData);

            return response.data;

        } catch (e) {

            throw `${e}: ${dataAdapter.incomingNumber}`;

        }
    }

    private async createLeads(dataAdapter: AmocrmCreateLeadDataAdapter): Promise<AmocrmCreateLeadResponse> {
        try {

            const response = await this.amocrmV4ApiService.createLeads<AmocrmCreateLeadResponse>(dataAdapter.amocrmRequestData);

            return response.data;

        } catch (e) {

            throw `${e}: ${dataAdapter.incomingNumber} ${dataAdapter.incomingTrunk} ${dataAdapter.contactsId}`;

        }
    }

    private async getIncomingNumberConfig(incomingTrunk: string): Promise<NumberInfo | undefined> {
        try {

            const config = await this.system.getConfig();

            return config.numbersInfo.find((numberInfo: NumberInfo) => numberInfo.trunkNumber === incomingTrunk);

        } catch (e) {

            throw e;
            
        }
    }
}