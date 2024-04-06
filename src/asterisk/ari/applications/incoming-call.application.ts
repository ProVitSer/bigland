import { AsteriskUtilsService } from '@app/asterisk/asterisk.utils';
import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { LogService } from '@app/log/log.service';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Ari, { StasisStart } from 'ari-client';
import {
  CALL_CENTER_EXTENSIONS,
  CONTINUE_DIALPLAN,
  CONTINUE_DIALPLAN_INCOMINGCALL_ERROR,
  INCOMING_CALL_DEFAULT_ROUTING,
} from '../ari.constants';
import { AmocrmV4Service } from '@app/amocrm/v4/services';
import { AmocrmGetContactsResponse } from '@app/amocrm/interfaces/amocrm.interfaces';
import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { PbxCallRoutingService } from '@app/pbx-call-routing/services/pbx-call-routing.service';
import { ExtensionRouteInfo } from '@app/pbx-call-routing/interfaces/pbx-call-routing.interfaces';
import { CallData, IncomingCallRoutingInfo } from '../interfaces/ari.interfaces';
import { AsteriskEnvironmentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class AriIncomingCallApplication implements OnApplicationBootstrap {
    private client: {
        ariClient: Ari.Client
    };
    private asteriskConfig = this.configService.get<AsteriskEnvironmentVariables>('asterisk');

    constructor(
        @Inject(AsteriskAriProvider.amocrm) private readonly ari: {
            ariClient: Ari.Client
        },
        private readonly configService: ConfigService,
        private readonly log: LogService,
        private readonly amocrmV4Service: AmocrmV4Service,
        private readonly amocrmUsers: AmocrmUsersService,
        private readonly pbxCallRoutingService: PbxCallRoutingService,
    ) {}

    public async onApplicationBootstrap() {

        if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {

            const amocrmConf = AsteriskUtilsService.getStasis(this.asteriskConfig.ari, AsteriskAriProvider.amocrm);

            this.client = this.ari;

            this.client.ariClient.on('StasisStart', async (stasisStartEvent: StasisStart) => {

                try {

                    this.log.info(`Событие входящего вызова ${JSON.stringify(stasisStartEvent)}`, AriIncomingCallApplication.name);

                    return await this.routingActions(stasisStartEvent);

                } catch (e) {

                    this.log.error(`${CONTINUE_DIALPLAN_INCOMINGCALL_ERROR}: ${e}`, AriIncomingCallApplication.name);

                    return await this.continueDialplan(stasisStartEvent.channel.id, INCOMING_CALL_DEFAULT_ROUTING);

                }
            });

            this.client.ariClient.start(amocrmConf.stasis);
        }
    }

    private async routingActions(event: StasisStart): Promise<void> {

        const contact = await this.getAmocrmContact(this.getCallData(event));

        await this.actionsInAmocrm(this.getCallData(event), contact);

        const routingInfo = await this.getRoutingInfo(contact);

        return await this.continueDialplan(event.channel.id, routingInfo);

    }

    private async getRoutingInfo(amocrmContact: AmocrmGetContactsResponse): Promise<IncomingCallRoutingInfo> {
        try {

            if (!amocrmContact._embedded) return INCOMING_CALL_DEFAULT_ROUTING;

            const amocrmUser = await this.amocrmUsers.getUserByAmocrmId(Number(amocrmContact._embedded.contacts[0].responsible_user_id));

            const routing = await this.pbxCallRoutingService.getExtensionRouteInfo(String(amocrmUser.localExtension));

            return this.checkRouting(routing);

        } catch (e) {

            this.log.error(amocrmContact._embedded.contacts[0], AriIncomingCallApplication.name);

            throw e;

        }
    }

    private checkRouting(routing: ExtensionRouteInfo): IncomingCallRoutingInfo {

        if (CALL_CENTER_EXTENSIONS.includes(routing.localExtension)) return INCOMING_CALL_DEFAULT_ROUTING;

        return {
            group: routing.extensionGroup,
            localExtension: routing.localExtension,
        };

    }

    private async getAmocrmContact(callData: CallData): Promise<AmocrmGetContactsResponse> {

        return await this.amocrmV4Service.getContactByNumber(callData.incomingNumber);

    }

    private getCallData(event: StasisStart): CallData {

        return {
            exten: event.channel.dialplan.exten,
            incomingNumber: event.channel.caller.number,
        };

    }

    private async actionsInAmocrm(callData: CallData, amocrmContact: AmocrmGetContactsResponse): Promise<void> {
        try {

            if (!amocrmContact._embedded) {

                return await this.amocrmV4Service.actionsInAmocrm(callData);
            };

        } catch (e) {

            throw e;

        }
    }
    

    private async continueDialplan(channelId: string, callRouting: IncomingCallRoutingInfo): Promise<void> {
        try {

            this.log.info(callRouting, AriIncomingCallApplication.name);

            return await new Promise((resolve) => {

                this.client.ariClient.channels.setChannelVar({
                    channelId: channelId,
                    variable: 'group',
                    value: callRouting.group
                });

                this.client.ariClient.channels.setChannelVar({
                    channelId: channelId,
                    variable: 'localExtension',
                    value: callRouting.localExtension,
                });

                this.client.ariClient.channels.continueInDialplan({
                    channelId: channelId
                }, (event: any) => {
                    this.log.info(`${CONTINUE_DIALPLAN}: ${channelId}`, AriIncomingCallApplication.name);
                    resolve(event);
                });

            });
        } catch (e) {

            throw e;
            
        }
    }
}