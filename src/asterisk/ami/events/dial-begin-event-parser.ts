import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { UtilsService } from '@app/utils/utils.service';
import { AsteriskDialBeginEvent } from '@app/asterisk/interfaces/asterisk.interfaces';
import { AsteriskAmiEventProviderInterface } from '../interfaces/ami.interfaces';
import { EVENT_INTERVAL } from '@app/asterisk/asterisk.constants';
import { AmocrmV2ApiService } from '@app/amocrm/v2/services/amocrm-v2-api.service';

@Injectable()
export class DialBeginEventParser implements AsteriskAmiEventProviderInterface {
  constructor(
    private readonly log: LogService,
    private readonly amocrmV2ApiService: AmocrmV2ApiService,
    private readonly amocrmUsers: AmocrmUsersService,
  ) {}

  async parseEvent(event: AsteriskDialBeginEvent): Promise<void> {
    try {
      return await this.parseDialBeginEvent(event);
    } catch (e) {
      throw e;
    }
  }

  private async parseDialBeginEvent(event: AsteriskDialBeginEvent) {
    try {
      if (!!event.destcalleridnum && event.destcalleridnum.toString().length == 3 && event.calleridnum.toString().length >= 10) {
        this.log.info(event, DialBeginEventParser.name);
        const eventTimer = EVENT_INTERVAL.shift();
        EVENT_INTERVAL.push(eventTimer);
        await UtilsService.sleep(eventTimer);
        await this.sendEvent(event.destcalleridnum, event.calleridnum);
      }
      return;
    } catch (e) {
      throw e;
    }
  }

  private async sendEvent(localExtension: string, incomingNumber: string) {
    const resultSearchId = await this.amocrmUsers.getAmocrmUser(localExtension);
    if (!!resultSearchId[0]?.amocrmId) {
      await this.amocrmV2ApiService.sendIncomingCallEvent(incomingNumber, Number(resultSearchId[0]?.amocrmId));
    }
  }
}
