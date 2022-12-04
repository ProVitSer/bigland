import { LogService } from '@app/log/log.service';
import { RedisService } from '@app/redis/redis.service';
import { System } from '@app/system/system.schema';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Ari, {
  Channel,
  ChannelDtmfReceived,
  Playback,
  StasisStart,
} from 'ari-client';
import { ChannelDTMF } from '../interfaces/asterisk.interfaces';

@Injectable()
export class AriChanSpyApplication implements OnApplicationBootstrap {
  private client: { ariClient: Ari.Client };
  private channelDTMF: ChannelDTMF;

  constructor(
    @Inject('ARI') private readonly ari: { ariClient: Ari.Client },
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly redis: RedisService,
  ) {}

  public async onApplicationBootstrap() {
    this.client = this.ari;
    this.client.ariClient.once(
      'StasisStart',
      async (event: StasisStart, incoming: Channel) => {
        try {
          this.log.info(
            `Подключение к прослушки канала ${JSON.stringify(event)}`,
            AriChanSpyApplication.name,
          );
          await this.handleDTMF(incoming);
        } catch (e) {
          this.log.info(
            `ARI AriChanSpyApplication ${e}`,
            AriChanSpyApplication.name,
          );
        }
      },
    );
    this.client.ariClient.start(
      this.configService.get('asterisk.ari.application.chanSpy'),
    );
  }

  private async handleDTMF(incomingChannel: Channel): Promise<void> {
    await incomingChannel.answer();
    await this.playSound(incomingChannel, 'sound:vm-password');
    incomingChannel.on(
      'ChannelDtmfReceived',
      async (event: ChannelDtmfReceived, channel: Channel) => {
        const digit = event.digit;
        if (this.channelDTMF[channel.id].dtmf.length == 4) {
          const isValid = await this.checkDTMFPassword(
            this.channelDTMF[channel.id].dtmf.join(''),
          );
          await this.continueDialplan(incomingChannel, isValid);
        } else {
          this.channelDTMF[channel.id].dtmf.push(digit);
        }
      },
    );
  }

  private async checkDTMFPassword(dtmfPassword: string): Promise<boolean> {
    const result = await this.redis.getCustomKey('config');
    const configJson = JSON.parse(result) as System;
    return dtmfPassword == configJson.chanSpyPassword;
  }

  private async continueDialplan(
    channel: Channel,
    isValid: boolean,
  ): Promise<void> {
    try {
      if (isValid) {
        return await new Promise((resolve) => {
          this.client.ariClient.channels.continueInDialplan(
            { channelId: channel.id },
            (event: any) => {
              this.log.info(
                `ARI AriChanSpyApplication continueDialplan ${channel.id}`,
                AriChanSpyApplication.name,
              );
              resolve(event);
            },
          );
        });
      } else {
        await this.playSound(channel, 'sound:vm-incorrect');
        await this.playSound(channel, 'sound:vm-goodbye');
      }
    } catch (e) {
      this.log.info(
        `ARI AriChanSpyApplication continueDialplan error ${e}`,
        AriChanSpyApplication.name,
      );
    }
  }

  private async playSound(
    incomingChannel: Channel,
    sound: string,
  ): Promise<Playback> {
    try {
      const playback = this.client.ariClient.Playback();
      return await incomingChannel.play({ media: sound }, playback);
    } catch (e) {
      this.log.info(
        `PlaybackFinished playback ${e}`,
        AriChanSpyApplication.name,
      );
    }
  }
}
