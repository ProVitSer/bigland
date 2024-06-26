import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { LogService } from '@app/log/log.service';
import { SystemService } from '@app/system/system.service';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Ari, { StasisStart } from 'ari-client';
import { AsteriskUtilsService } from '../../asterisk.utils';
import { CONTINUE_DIALPLAN, CONTINUE_DIALPLAN_BLACKLIST_ERROR, NUMBER_IN_BLACK_LIST } from '../ari.constants';
import { HangupReason } from '../interfaces/ari.enum';
import { AsteriskEnvironmentVariables } from '@app/config/interfaces/config.interface';
import { UtilsService } from '@app/utils/utils.service';

@Injectable()
export class AriBlackListApplication implements OnApplicationBootstrap {
    private client: {
        ariClient: Ari.Client
    };
    private asteriskConfig = this.configService.get<AsteriskEnvironmentVariables> ('asterisk');

    constructor(
        @Inject(AsteriskAriProvider.blacklist) private readonly ari: {
            ariClient: Ari.Client
        },
        private readonly log: LogService,
        private readonly configService: ConfigService,
        private readonly system: SystemService,
    ) {}

    public async onApplicationBootstrap() {

        if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {

            const blacklistConf = AsteriskUtilsService.getStasis(this.asteriskConfig.ari, AsteriskAriProvider.blacklist);

            this.client = this.ari;

            this.client.ariClient.on('StasisStart', async (stasisStartEvent: StasisStart) => {
                try {

                    this.log.info(`Событие входящего вызова ${JSON.stringify(stasisStartEvent)}`, AriBlackListApplication.name);

                    (await this.checkInBlackList(stasisStartEvent)) ? this.hangupChannel(stasisStartEvent): await this.continueDialplan(stasisStartEvent.channel.id);

                } catch (e) {

                    this.log.error(`${CONTINUE_DIALPLAN_BLACKLIST_ERROR}: ${e}`, AriBlackListApplication.name);

                    return await this.continueDialplan(stasisStartEvent.channel.id);

                }
            });

            this.client.ariClient.start(blacklistConf.stasis);
        }
    }

    private async checkInBlackList(event: StasisStart): Promise<boolean> {
        try {

            const incomingNumber = UtilsService.normalizePhoneNumber(event.channel.caller.number);

            const config = await this.system.getConfig();

            return this.check(config.blackListNumbers, incomingNumber);

        } catch (e) {

            throw e;

        }
    }

    private check(blackListNumbers: string[], incomingNumber: string): boolean {

        return blackListNumbers.some((blackListNumber: string) => incomingNumber === blackListNumber);

    }

    private async continueDialplan(channelId: string): Promise<void> {
        try {

            return await new Promise((resolve) => {
                this.client.ariClient.channels.continueInDialplan({
                    channelId: channelId
                }, (event: any) => {
                    this.log.info(`${CONTINUE_DIALPLAN}: ${channelId}`, AriBlackListApplication.name);
                    resolve(event);
                });
            });

        } catch (e) {

            throw e;

        }
    }

    private hangupChannel(event: StasisStart): Promise<void> {

        this.log.info(`${NUMBER_IN_BLACK_LIST}:  ${JSON.stringify(event)}`, AriBlackListApplication.name);

        return this.client.ariClient.channels.hangup({
            channelId: event.channel.id,
            reason: HangupReason.busy
        });
        
    }
}