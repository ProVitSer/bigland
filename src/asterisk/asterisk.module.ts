import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as ARI from 'ari-client';
import * as namiLib from 'nami';
import { HangupEventParser } from './ami/hangup-event-parser';
import { AsteriskAmi } from './asterisk-ami';
import { AmiActionService } from './ami/action-service';
import { BlindTransferEventParser } from './ami/blind-transfer-event-parser';
import { AriIncomingCallApplication } from './ari/incoming-call.application';
import { AriActionService } from './ari/action-service';
import { DialBeginEventParser } from './ami/dial-begin-event-parser';
import { RedisModule } from '@app/redis/redis.module';
import { NewExtenEventParser } from './ami/new-exten-event-parser';
import { AriBlackListApplication } from './ari/black-list.application';
import { AriChanSpyApplication } from './ari/chan-spy.application';
import { LogModule } from '@app/log/log.module';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { AmocrmUsersModule } from '@app/amocrm-users/amocrm-users.module';
import { AmocrmModule } from '@app/amocrm/amocrm.module';

@Module({
  imports: [
    ConfigModule,
    LogModule,
    AsteriskCdrModule,
    RedisModule,
    AmocrmUsersModule,
    AmocrmModule,
  ],
  providers: [
    {
      provide: 'CHANSPY',
      useFactory: async (configService: ConfigService) => {
        return {
          ariClient: await ARI.connect(
            configService.get('asterisk.ari.url'),
            configService.get('asterisk.ari.application.chanspy.user'),
            configService.get('asterisk.ari.application.chanspy.password'),
          ),
        };
      },
      inject: [ConfigService],
    },
    {
      provide: 'AMOCRM',
      useFactory: async (configService: ConfigService) => {
        return {
          ariClient: await ARI.connect(
            configService.get('asterisk.ari.url'),
            configService.get('asterisk.ari.application.amocrm.user'),
            configService.get('asterisk.ari.application.amocrm.password'),
          ),
        };
      },
      inject: [ConfigService],
    },
    {
      provide: 'BLACKLIST',
      useFactory: async (configService: ConfigService) => {
        return {
          ariClient: await ARI.connect(
            configService.get('asterisk.ari.url'),
            configService.get('asterisk.ari.application.blackList.user'),
            configService.get('asterisk.ari.application.blackList.password'),
          ),
        };
      },
      inject: [ConfigService],
    },
    {
      provide: 'ARICALL',
      useFactory: async (configService: ConfigService) => {
        return {
          ariClient: await ARI.connect(
            configService.get('asterisk.ari.url'),
            configService.get('asterisk.ari.application.aricall.user'),
            configService.get('asterisk.ari.application.aricall.password'),
          ),
        };
      },
      inject: [ConfigService],
    },
    {
      provide: 'AMI',
      useFactory: async (configService: ConfigService) => {
        return new namiLib.Nami({
          username: configService.get('asterisk.ami.username'),
          secret: configService.get('asterisk.ami.password'),
          host: configService.get('asterisk.ami.host'),
          port: configService.get('asterisk.ami.port'),
        });
      },
      inject: [ConfigService],
    },
    AriIncomingCallApplication,
    AriBlackListApplication,
    AriChanSpyApplication,
    AsteriskAmi,
    HangupEventParser,
    DialBeginEventParser,
    BlindTransferEventParser,
    NewExtenEventParser,
    AmiActionService,
    AriActionService,
  ],
  exports: [
    'CHANSPY',
    'AMOCRM',
    'BLACKLIST',
    'ARICALL',
    'AMI',
    AriIncomingCallApplication,
    AriBlackListApplication,
    AriChanSpyApplication,
    AsteriskAmi,
    HangupEventParser,
    AmiActionService,
    AriActionService,
  ],
})
export class AsteriskModule {}
