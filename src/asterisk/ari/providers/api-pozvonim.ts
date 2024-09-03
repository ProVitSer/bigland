import { AsteriskAriCall, AsteriskAriOriginate } from '../interfaces/ari.interfaces';
import { ApiCall, PozvominCall } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import Ari from 'ari-client';
import { Injectable } from '@nestjs/common';
import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { AmocrmV2ApiService } from '@app/amocrm/v2/services/amocrm-v2-api.service';
import { LogService } from '@app/log/log.service';
import { ChannelType, EndpointState } from '../interfaces/ari.enum';
import { ApiPozvonimCallDataAdapter } from '../adapters/api-pozvonim-call.adapter';

@Injectable()
export class ApiPozvonimAriCall implements AsteriskAriCall {
    constructor(
        private readonly amocrmV2ApiService: AmocrmV2ApiService,
        private readonly amocrmUsers: AmocrmUsersService,
        private readonly apiPozvonimCallDataAdapter: ApiPozvonimCallDataAdapter,
        private readonly log: LogService,
    ) {}
    async getOriginateInfo(data: ApiCall, ariClient: Ari.Client): Promise<AsteriskAriOriginate> {
        try {

            if (!(await this.checkEndpointExist(ariClient, data.sip_id))) return await this.sendCallToCC(data);

            if (!(await this.checkEndpointState(ariClient, data.sip_id))) return await this.sendCallToCC(data);

            return await this.sendCallToLocalExtension(data);

        } catch (e) {

            this.log.error(e, ApiPozvonimAriCall.name);

            throw e;

        }
    }

    private async sendCallToCC(data: ApiCall): Promise<AsteriskAriOriginate> {
        try {

            return await this.apiPozvonimCallDataAdapter.getCCOriginateInfo(data);

        } catch (e) {

            throw e;

        }
    }

    private async sendCallToLocalExtension(data: ApiCall): Promise<AsteriskAriOriginate> {
        try {

            const amocrmUsers = await this.amocrmUsers.getAmocrmUser(data.sip_id);

            await this.amocrmV2ApiService.sendIncomingCallEvent(data.dst_number, Number(amocrmUsers[0]?.amocrmId));

            return await this.apiPozvonimCallDataAdapter.getLocalExtensionOriginateInfo(data);

        } catch (e) {

            throw e;

        }
    }

    private async checkEndpointExist(ariClient: Ari.Client, extension: string): Promise<boolean> {

        const endpoints = await ariClient.endpoints.list();

        return endpoints
            .filter((endpoint: Ari.Endpoint) => /^\d{3}$/.test(endpoint.resource))
            .map((endpoint: Ari.Endpoint) => endpoint.resource)
            .includes(extension);

    }

    private async checkEndpointState(ariClient: Ari.Client, extension: string): Promise<boolean> {

        const endpoints = await ariClient.endpoints.get({
            tech: ChannelType.PJSIP,
            resource: extension
        });

        return endpoints.state == EndpointState.online;
        
    }
}