import { LogService } from '@app/log/log.service';
import { RedisService } from '@app/redis/redis.service';
import { System } from '@app/system/system.schema';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Ari, {
  Channel,
  ChannelDtmfReceived,
  Playback,
  PlaybackStarted,
  StasisStart,
} from 'ari-client';

@Injectable()
export class AriChanSpyApplication implements OnApplicationBootstrap {
  private client: { ariClient: Ari.Client };
  private channelDTMF: { [key: string]: { dtmf: string[] } };

  constructor(
    @Inject('CHANSPY') private readonly ari: { ariClient: Ari.Client },
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly redis: RedisService,
  ) {}

  public async onApplicationBootstrap() {
    this.client = this.ari;
    this.client.ariClient.on(
      'StasisStart',
      async (event: StasisStart, incoming: Channel) => {
        try {
          this.log.info(
            `Подключение к прослушки канала ${JSON.stringify(event)}`,
            AriChanSpyApplication.name,
          );
          await this.handleDTMF(incoming);
          console.log('Вышли');
          return;
        } catch (e) {
          this.log.error(
            `ARI AriChanSpyApplication ${e}`,
            AriChanSpyApplication.name,
          );
        }
      },
    );
    this.client.ariClient.start(
      this.configService.get('asterisk.ari.application.chanspy.stasis'),
    );
  }

  private async handleDTMF(incomingChannel: Channel): Promise<void> {
    await incomingChannel.answer();
    await this.playSound(incomingChannel, 'sound:agent-pass');
    const channelDTMF: string[] = [];
    return await new Promise(async (resolve: any) => {
      incomingChannel.on(
        'ChannelDtmfReceived',
        async (event: ChannelDtmfReceived, channel: Channel) => {
          const digit = event.digit;
          if (channelDTMF.length == 4) {
            const isValid = await this.checkDTMFPassword(channelDTMF.join(''));
            await this.continueDialplan(channel, isValid);
            resolve({});
          } else {
            channelDTMF.push(digit);
            resolve({});
          }
        },
      );
    });
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
              console.log(event);
              this.log.info(
                `ARI AriChanSpyApplication continueDialplan ${channel.id}`,
                AriChanSpyApplication.name,
              );
              console.log(event);

              resolve(event);
            },
          );
        });
      } else {
        await this.playSound(channel, 'sound:vm-incorrect');
        await this.playSound(channel, 'sound:vm-goodbye');
        return await channel.hangup();
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
  ): Promise<any> {
    try {
      await new Promise(async (resolve: any) => {
        const playback = this.client.ariClient.Playback();
        const play = await incomingChannel.play(
          {
            media: sound,
          },
          playback,
        );

        play.once(
          'PlaybackFinished',
          async (event: PlaybackStarted, playback: Playback) => {
            resolve({});
          },
        );
      });
    } catch (e) {
      this.log.info(
        `PlaybackFinished playback ${e}`,
        AriChanSpyApplication.name,
      );
    }
  }
}
