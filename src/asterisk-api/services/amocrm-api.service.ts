import { AmiActionService } from '@app/asterisk/ami/action-service';
import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { AmocrmDto } from '../dto/amocrm.dto';

@Injectable()
export class AmocrmApiService {
  constructor(
    private readonly ami: AmiActionService,
    private readonly log: LogService,
  ) {}

  public async amocrmWidget(query: AmocrmDto): Promise<any> {
    try {
      switch (query._action) {
        case 'call':
          this.log.info(
            console.log('Запросы вызова из Amocrm', query._action),
            AmocrmApiService.name,
          );
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
          this.log.error(
            `Ошибка запроса ${query._action}`,
            AmocrmApiService.name,
          );
          this.log.error(`Ошибка запроса ${query}`, AmocrmApiService.name);
          throw new Error('Ошибка запроса');
      }
    } catch (e) {
      throw e;
    }
  }
}
