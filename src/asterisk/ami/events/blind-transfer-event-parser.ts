import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { AsteriskBlindTransferEvent } from '../../interfaces/asterisk.interfaces';
import { AsteriskAmiEventProviderInterface } from '../interfaces/ami.interfaces';
import { AmocrmV2ApiService } from '@app/amocrm/v2/services/amocrm-v2-api.service';

@Injectable()
export class BlindTransferEventParser implements AsteriskAmiEventProviderInterface {
  constructor(
    private readonly log: LogService,
    private readonly amocrmV2ApiService: AmocrmV2ApiService,
    private readonly amocrmUsers: AmocrmUsersService,
  ) {}

  async parseEvent(event: AsteriskBlindTransferEvent): Promise<void> {
    try {
      return await this.parseBlindTransferEvent(event);
    } catch (e) {
      this.log.error(String(event), BlindTransferEventParser.name);
    }
  }

  private async parseBlindTransferEvent(event: AsteriskBlindTransferEvent) {
    try {
      if (!!event.extension && event.extension.toString().length == 3 && event.transfererconnectedlinenum.toString().length >= 10) {
        const resultSearchId = await this.amocrmUsers.getAmocrmUser(event.extension);
        !!resultSearchId[0]?.amocrmId
          ? await this.amocrmV2ApiService.sendIncomingCallEvent(event.transfererconnectedlinenum, Number(resultSearchId[0]?.amocrmId))
          : '';
      }
    } catch (e) {
      throw e;
    }
  }
}
