import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AsteriskAmi } from './asterisk-ami';
import { AmiActionService } from './ami/action-service';
import { RedisModule } from '@app/redis/redis.module';
import { LogModule } from '@app/log/log.module';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { AmocrmUsersModule } from '@app/amocrm-users/amocrm-users.module';
import { AmocrmModule } from '@app/amocrm/amocrm.module';
import {
  createAsteriskAmi,
  createAsteriskAri,
  getAsteriskAmiProvidesName,
  getAsteriskAriProvidesName,
} from '@app/config/project-configs/asterisk.config';
import { AsteriskUtilsService } from './asterisk.utils';
import { AriChanSpyApplication, AriBlackListApplication, AriActionService, AriIncomingCallApplication } from './ari';
import { HangupEventParser, BlindTransferEventParser, DialBeginEventParser, NewExtenEventParser } from './ami';

const asteriskAriProviders = createAsteriskAri();
const asteriskAmiProviders = createAsteriskAmi();
const ariProvidersName = getAsteriskAriProvidesName();
const amiProvidersName = getAsteriskAmiProvidesName();

@Module({
  imports: [ConfigModule, LogModule, AsteriskCdrModule, RedisModule, AmocrmUsersModule, AmocrmModule],
  providers: [
    ...asteriskAriProviders,
    ...asteriskAmiProviders,
    AriIncomingCallApplication,
    AriBlackListApplication,
    AriChanSpyApplication,
    AsteriskAmi,
    AmiActionService,
    AriActionService,
    AsteriskUtilsService,
    HangupEventParser,
    BlindTransferEventParser,
    DialBeginEventParser,
    NewExtenEventParser,
  ],
  exports: [
    ...ariProvidersName,
    ...amiProvidersName,
    AriIncomingCallApplication,
    AriBlackListApplication,
    AriChanSpyApplication,
    AsteriskAmi,
    AmiActionService,
    AriActionService,
  ],
})
export class AsteriskModule {}
