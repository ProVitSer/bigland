import { LogService } from '@app/log/log.service';
import { RedisService } from '@app/redis/redis.service';
import { System } from '@app/system/system.schema';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Ari, { StasisStart } from 'ari-client';
import { CONTINUE_DIALPLAN, CONTINUE_DIALPLAN_ERROR } from './ari.constants';

@Injectable()
export class AriBlackListApplication implements OnApplicationBootstrap {
  private client: { ariClient: Ari.Client };

  constructor(
    @Inject('BLACKLIST') private readonly ari: { ariClient: Ari.Client },
    private readonly log: LogService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {}

  public async onApplicationBootstrap() {
    this.client = this.ari;
    this.client.ariClient.on('StasisStart', async (stasisStartEvent: StasisStart) => {
      try {
        this.log.info(`Событие входящего вызова ${JSON.stringify(stasisStartEvent)}`, AriBlackListApplication.name);
        (await this.checkInBlackList(stasisStartEvent))
          ? this.hangupChannel(stasisStartEvent.channel.id)
          : await this.continueDialplan(stasisStartEvent.channel.id);
      } catch (e) {
        this.log.error(`${CONTINUE_DIALPLAN_ERROR}: ${e}`, AriBlackListApplication.name);
      }
    });
    this.client.ariClient.start(this.configService.get('asterisk.ari.application.blackList.stasis'));
  }

  private async checkInBlackList(event: StasisStart): Promise<boolean> {
    try {
      const incomingNumber = event.channel.caller.number;
      const config = await this.redis.getCustomKey('config');
      const configJson = JSON.parse(config) as System;
      return this.check(configJson.blackListNumbers, incomingNumber);
    } catch (e) {
      throw e;
    }
  }

  private check(arr: string[], val: string) {
    return arr.some((arrVal) => val === arrVal);
  }

  private async continueDialplan(channelId: string): Promise<void> {
    try {
      return await new Promise((resolve) => {
        this.client.ariClient.channels.continueInDialplan({ channelId: channelId }, (event: any) => {
          this.log.info(`${CONTINUE_DIALPLAN}: ${channelId}`, AriBlackListApplication.name);
          resolve(event);
        });
      });
    } catch (e) {
      throw e;
    }
  }

  private hangupChannel(channelId: string) {
    return this.client.ariClient.channels.hangup({ channelId: channelId });
  }
}
