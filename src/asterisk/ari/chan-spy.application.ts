import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { LogService } from '@app/log/log.service';
import { RedisService } from '@app/redis/redis.service';
import { System } from '@app/system/system.schema';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Ari, { Channel, ChannelDtmfReceived, Playback, PlaybackStarted, StasisStart } from 'ari-client';
import { AsteriskUtilsService } from '../asterisk.utils';
import { PlaybackSounds } from '../interfaces/asterisk.enum';
import { CONTINUE_DIALPLAN, CONTINUE_DIALPLAN_ERROR, PLAYBACK_ERROR } from './ari.constants';

@Injectable()
export class AriChanSpyApplication implements OnApplicationBootstrap {
  private client: { ariClient: Ari.Client };
  private channelDTMF: { [key: string]: { dtmf: string[] } };

  constructor(
    @Inject(AsteriskAriProvider.chanspy) private readonly ari: { ariClient: Ari.Client },
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly redis: RedisService,
  ) {}

  public async onApplicationBootstrap() {
    const chanspyConf = AsteriskUtilsService.getStasis(this.configService.get('asterisk.ari'), AsteriskAriProvider.chanspy);
    this.client = this.ari;
    this.client.ariClient.on('StasisStart', async (event: StasisStart, incoming: Channel) => {
      try {
        this.log.info(`Подключение к прослушки канала ${JSON.stringify(event)}`, AriChanSpyApplication.name);
        await this.handleDTMF(incoming);
        return;
      } catch (e) {
        this.log.error(`${PLAYBACK_ERROR}: ${e}`, AriChanSpyApplication.name);
      }
    });
    this.client.ariClient.start(chanspyConf.stasis);
  }

  private async handleDTMF(incomingChannel: Channel): Promise<void> {
    await incomingChannel.answer();
    await this.playSound(incomingChannel, PlaybackSounds.DialPass);
    const channelDTMF: string[] = [];
    return await new Promise(async (resolve: any) => {
      incomingChannel.on('ChannelDtmfReceived', async (event: ChannelDtmfReceived, channel: Channel) => {
        const digit = event.digit;
        if (channelDTMF.length == 4) {
          const isValid = await this.checkDTMFPassword(channelDTMF.join(''));
          await this.continueDialplan(channel, isValid);
          resolve({});
        } else {
          channelDTMF.push(digit);
          resolve({});
        }
      });
    });
  }

  private async checkDTMFPassword(dtmfPassword: string): Promise<boolean> {
    const result = await this.redis.getCustomKey('config');
    const configJson = JSON.parse(result) as System;
    return dtmfPassword == configJson.chanSpyPassword;
  }

  private async continueDialplan(channel: Channel, isValid: boolean): Promise<void> {
    try {
      if (isValid) {
        return await new Promise((resolve) => {
          this.client.ariClient.channels.continueInDialplan({ channelId: channel.id }, (event: any) => {
            this.log.info(`${CONTINUE_DIALPLAN}: ${channel.id}`, AriChanSpyApplication.name);
            resolve(event);
          });
        });
      } else {
        await this.playSound(channel, PlaybackSounds.IncorrectPass);
        await this.playSound(channel, PlaybackSounds.Goodbye);
        return await channel.hangup();
      }
    } catch (e) {
      this.log.info(`${CONTINUE_DIALPLAN_ERROR}: ${e}`, AriChanSpyApplication.name);
      throw e;
    }
  }

  private async playSound(incomingChannel: Channel, sound: string): Promise<any> {
    try {
      await new Promise(async (resolve: any) => {
        const playback = this.client.ariClient.Playback();
        const play = await incomingChannel.play(
          {
            media: sound,
          },
          playback,
        );

        play.once('PlaybackFinished', async (event: PlaybackStarted, playback: Playback) => {
          resolve({});
        });
      });
    } catch (e) {
      throw e;
    }
  }
}
