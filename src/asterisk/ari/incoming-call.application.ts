import { AmocrmV4Service } from '@app/amocrm/amocrm.service';
import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { LogService } from '@app/log/log.service';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Ari, { StasisStart } from 'ari-client';
import { AsteriskUtilsService } from '../asterisk.utils';
import { CONTINUE_DIALPLAN, CONTINUE_DIALPLAN_ERROR } from './ari.constants';

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
    const amocrmConf = AsteriskUtilsService.getStasis(this.configService.get('asterisk.ari'), AsteriskAriProvider.amocrm);
    this.client = this.ari;
    this.client.ariClient.on('StasisStart', async (stasisStartEvent: StasisStart) => {
      try {
        this.log.info(`Событие входящего вызова ${JSON.stringify(stasisStartEvent)}`, AriIncomingCallApplication.name);
        await this.checkInAmo(stasisStartEvent);
        return this.continueDialplan(stasisStartEvent.channel.id);
      } catch (e) {
        this.log.error(`${CONTINUE_DIALPLAN_ERROR}: ${e}`, AriIncomingCallApplication.name);
      }
    });
    this.client.ariClient.start(amocrmConf.stasis);
  }

  private async checkInAmo(event: StasisStart): Promise<void> {
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
