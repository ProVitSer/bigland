import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { AmocrmDto } from '../dto/amocrm.dto';
import { AmiActionService } from '@app/asterisk/ami/services/action-service';
import { ConfigService } from '@nestjs/config';
import { AUTH_AMOCRM_ERROR } from '../asterisk-api.constants';
import { AmocrmActionStatus } from '../interfaces/asterisk-api.enum';

@Injectable()
export class AmocrmApiService {
  constructor(private readonly ami: AmiActionService, private readonly log: LogService, private readonly config: ConfigService) {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  public async amocrmWidget(query: AmocrmDto): Promise<string | { [key: string]: any }> {
    if (query._login == this.config.get('amocrm.widget.login') && query._secret == this.config.get('amocrm.widget.secret')) {
      try {
        switch (query._action) {
          case AmocrmActionStatus.call:
            await this.ami.sendAmiCall(query.from, query.to);
            return {};
          case AmocrmActionStatus.status:
            const callIfo = await this.ami.getCallStatus();
            const sendStatus = {
              status: 'ok',
              action: query._action,
              data: callIfo[0],
            };
            return 'asterisk_cb(' + JSON.stringify(sendStatus) + ');';
          case AmocrmActionStatus.cdr:
            return {};
          default:
            this.log.error(query, AmocrmApiService.name);
        }
      } catch (e) {
        this.log.error(e, AmocrmApiService.name);
        throw e;
      }
    } else {
      throw AUTH_AMOCRM_ERROR;
    }
  }
}
