import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { AmocrmDto } from '../dto/amocrm.dto';
import { AmiActionService } from '@app/asterisk/ami/services/action-service';

@Injectable()
export class AmocrmApiService {
  constructor(private readonly ami: AmiActionService, private readonly log: LogService) {}

  public async amocrmWidget(query: AmocrmDto): Promise<any> {
    try {
      switch (query._action) {
        case 'call':
          await this.ami.sendAmiCall(query.from, query.to);
          return {};
        case 'status':
          const callIfo = await this.ami.getCallStatus();
          const sendStatus = {
            status: 'ok',
            action: query._action,
            data: callIfo[0],
          };
          return 'asterisk_cb(' + JSON.stringify(sendStatus) + ');';
        case 'cdr':
          return {};
        default:
          this.log.error(`Ошибка запроса ${query}`, AmocrmApiService.name);
      }
    } catch (e) {
      throw e;
    }
  }
}
