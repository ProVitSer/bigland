import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { AmocrmV2Service } from '@app/amocrm/amocrm.service';
import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { AsteriskAmiEventProviderInterface, AsteriskDialBeginEvent } from '../interfaces/asterisk.interfaces';

@Injectable()
export class DialBeginEventParser implements AsteriskAmiEventProviderInterface {
  constructor(
    private readonly log: LogService,
    private readonly amocrmV2Service: AmocrmV2Service,
    private readonly amocrmUsers: AmocrmUsersService,
  ) {}

  async parseEvent(event: AsteriskDialBeginEvent): Promise<void> {
    try {
      return await this.parseDialBeginEvent(event);
    } catch (e) {
      this.log.error(String(event), DialBeginEventParser.name);
    }
  }

  private async parseDialBeginEvent(event: AsteriskDialBeginEvent) {
    try {
      if (!!event.destcalleridnum && event.destcalleridnum.toString().length == 3 && event.calleridnum.toString().length >= 10) {
        const resultSearchId = await this.amocrmUsers.getAmocrmUser(event.destcalleridnum);
        !!resultSearchId[0]?.amocrmId
          ? await this.amocrmV2Service.incomingCallEvent(event.calleridnum, String(resultSearchId[0]?.amocrmId))
          : '';
      }
    } catch (e) {
      throw e;
    }
  }
}
