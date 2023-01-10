import { AmocrmService } from '@app/amocrm/amocrm.service';
import { LogService } from '@app/log/log.service';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Ari, { StasisStart } from 'ari-client';

@Injectable()
export class AriIncomingCallApplication implements OnApplicationBootstrap {
  private client: { ariClient: Ari.Client };

  constructor(
    @Inject('AMOCRM') private readonly ari: { ariClient: Ari.Client },
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly amocrmApi: AmocrmService,
  ) {}

  public async onApplicationBootstrap() {
    this.client = this.ari;
    this.client.ariClient.on(
      'StasisStart',
      async (stasisStartEvent: StasisStart) => {
        try {
          this.log.info(
            `Событие входящего вызова ${JSON.stringify(stasisStartEvent)}`,
            AriIncomingCallApplication.name,
          );
          await this.checkInAmo(stasisStartEvent);
          return this.continueDialplan(stasisStartEvent.channel.id);
        } catch (e) {
          this.log.error(
            `ARI AriIncomingCallApplication error ${e}`,
            AriIncomingCallApplication.name,
          );
        }
      },
    );
    this.client.ariClient.start(
      this.configService.get('asterisk.ari.application.amocrm.stasis'),
    );
  }

  private async checkInAmo(event: StasisStart): Promise<void> {
    try {
      const incomingTrunk = event.channel.dialplan.exten;
      return await this.amocrmApi.actionsInAmocrm(
        event.channel.caller.number,
        incomingTrunk,
      );
    } catch (e) {
      throw e;
    }
  }

  private async continueDialplan(channelId: string): Promise<void> {
    try {
      return await new Promise((resolve) => {
        this.client.ariClient.channels.continueInDialplan(
          { channelId: channelId },
          (event: any) => {
            this.log.info(
              `ARI AriIncomingCallApplication continueDialplan ${channelId}`,
              AriIncomingCallApplication.name,
            );
            resolve(event);
          },
        );
      });
    } catch (e) {
      this.log.error(
        `ARI AriIncomingCallApplication continueDialplan error ${e}`,
        AriIncomingCallApplication.name,
      );
    }
  }
}
