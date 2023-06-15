import { AmocrmV4Service } from '@app/amocrm/v4/amocrm-v4.service';
import { AsteriskUtilsService } from '@app/asterisk/asterisk.utils';
import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { LogService } from '@app/log/log.service';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Ari, { StasisStart } from 'ari-client';
import { CONTINUE_DIALPLAN, CONTINUE_DIALPLAN_INCOMINGCALL_ERROR } from '../ari.constants';

@Injectable()
export class AriIncomingCallApplication implements OnApplicationBootstrap {
  private client: { ariClient: Ari.Client };

  constructor(
    @Inject(AsteriskAriProvider.amocrm) private readonly ari: { ariClient: Ari.Client },
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly amocrmV4Service: AmocrmV4Service,
  ) {}

  public async onApplicationBootstrap() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      const amocrmConf = AsteriskUtilsService.getStasis(this.configService.get('asterisk.ari'), AsteriskAriProvider.amocrm);
      this.client = this.ari;
      this.client.ariClient.on('StasisStart', async (stasisStartEvent: StasisStart) => {
        try {
          this.log.info(`Событие входящего вызова ${JSON.stringify(stasisStartEvent)}`, AriIncomingCallApplication.name);
          await this.actionsInAmocrm(stasisStartEvent);
          return this.continueDialplan(stasisStartEvent.channel.id);
        } catch (e) {
          this.log.error(`${CONTINUE_DIALPLAN_INCOMINGCALL_ERROR}: ${e}`, AriIncomingCallApplication.name);
          return await this.continueDialplan(stasisStartEvent.channel.id);
        }
      });
      this.client.ariClient.start(amocrmConf.stasis);
    }
  }

  private async actionsInAmocrm(event: StasisStart): Promise<void> {
    try {
      const incomingTrunk = event.channel.dialplan.exten;
      return await this.amocrmV4Service.actionsInAmocrm(event.channel.caller.number, incomingTrunk);
    } catch (e) {
      throw e;
    }
  }

  private async continueDialplan(channelId: string): Promise<void> {
    try {
      return await new Promise((resolve) => {
        this.client.ariClient.channels.continueInDialplan({ channelId: channelId }, (event: any) => {
          this.log.info(`${CONTINUE_DIALPLAN}: ${channelId}`, AriIncomingCallApplication.name);
          resolve(event);
        });
      });
    } catch (e) {
      throw e;
    }
  }
}
