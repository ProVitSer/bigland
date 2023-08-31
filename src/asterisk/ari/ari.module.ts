import { AmocrmUsersModule } from '@app/amocrm-users/amocrm-users.module';
import { AmocrmModule } from '@app/amocrm/amocrm.module';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { createAsteriskAri, getAsteriskAriProvidesName } from '@app/config/project-configs/asterisk.config';
import { LogModule } from '@app/log/log.module';
import { OperatorsModule } from '@app/operators/operators.module';
import { PbxCallRoutingModule } from '@app/pbx-call-routing/pbx-call-routing.module';
import { SystemModule } from '@app/system/system.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AsteriskUtilsService } from '../asterisk.utils';
import { PozvonimCallDataAdapter } from './adapters/pozvonim-call.adapter';
import { AriIncomingCallApplication, AriBlackListApplication, AriChanSpyApplication } from './applications';
import { AriACallService } from './ari-call.service';
import { PozvonimAriCall, MonitoringAriCall, CheckSpamNumberAriCall, CheckOperatorSpamAriCall } from './providers';

const asteriskAriProviders = createAsteriskAri();
const ariProvidersName = getAsteriskAriProvidesName();

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
    ...asteriskAriProviders,
    AriIncomingCallApplication,
    AriBlackListApplication,
    AriChanSpyApplication,
    AriACallService,
    AsteriskUtilsService,
    PozvonimCallDataAdapter,
    PozvonimAriCall,
    MonitoringAriCall,
    CheckSpamNumberAriCall,
    CheckOperatorSpamAriCall,
  ],
  exports: [...ariProvidersName, AriIncomingCallApplication, AriBlackListApplication, AriChanSpyApplication, AriACallService],
})
export class AriModule {}
