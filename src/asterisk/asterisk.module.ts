import { Module } from '@nestjs/common';
import { AsteriskAmi } from './ami/ami';
import { AmiActionService } from './ami/services/action-service';
import { AriIncomingCallApplication, AriBlackListApplication, AriChanSpyApplication } from './ari/applications';
import { AriACallService } from './ari/ari-call.service';
import { AmiModule } from './ami/ami.module';
import { AriModule } from './ari/ari.module';

@Module({
  imports: [AmiModule, AriModule],
  exports: [AriIncomingCallApplication, AriBlackListApplication, AriChanSpyApplication, AsteriskAmi, AmiActionService, AriACallService],
})
export class AsteriskModule {}
