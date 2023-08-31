import { createAsteriskAmi, getAsteriskAmiProvidesName } from '@app/config/project-configs/asterisk.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AsteriskAmi } from './ami';
import { AmiActionService } from './services/action-service';
import { BlindTransferEventParser, DialBeginEventParser, HangupEventParser, NewExtenEventParser } from './events';
import { LogModule } from '@app/log/log.module';
import { AmocrmUsersModule } from '@app/amocrm-users/amocrm-users.module';
import { AmocrmModule } from '@app/amocrm/amocrm.module';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { OperatorsModule } from '@app/operators/operators.module';
import { PbxCallRoutingModule } from '@app/pbx-call-routing/pbx-call-routing.module';
import { SystemModule } from '@app/system/system.module';
import { AsteriskUtilsService } from '../asterisk.utils';

const asteriskAmiProviders = createAsteriskAmi();
const amiProvidersName = getAsteriskAmiProvidesName();

@Module({
  imports: [
    ConfigModule,
    LogModule,
    AsteriskCdrModule,
    SystemModule,
    AmocrmUsersModule,
    AmocrmModule,
    OperatorsModule,
    PbxCallRoutingModule,
  ],
  providers: [
    ...asteriskAmiProviders,
    AsteriskUtilsService,
    AsteriskAmi,
    AmiActionService,
    HangupEventParser,
    BlindTransferEventParser,
    DialBeginEventParser,
    NewExtenEventParser,
  ],
  exports: [...amiProvidersName, AsteriskAmi, AmiActionService],
})
export class AmiModule {}
