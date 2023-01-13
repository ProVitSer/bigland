import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
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
import { ASTERISK_ARI_PROVIDER, createAsteriskAri, getAsteriskAmiFactory } from '@app/config/asterisk.config';

const asteriskAriProviders = createAsteriskAri();

@Module({
  imports: [ConfigModule, LogModule, AsteriskCdrModule, RedisModule, AmocrmUsersModule, AmocrmModule],
  providers: [
    ...asteriskAriProviders,
    {
      provide: 'AMI',
      useFactory: getAsteriskAmiFactory,
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
    ...ASTERISK_ARI_PROVIDER,
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
