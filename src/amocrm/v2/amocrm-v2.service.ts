import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LogService } from '@app/log/log.service';
import { UtilsService } from '@app/utils/utils.service';
import { AmocrmAPIV2 } from '../interfaces/amocrm.enum';
import { AmocrmV2Connector } from './amocrm-v2.connect';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class AmocrmV2Service {
  constructor(private readonly amocrm: AmocrmV2Connector, private readonly log: LogService, private httpService: HttpService) {}

  public async incomingCallEvent(incomingNumber: string, eventResponsibleUserId: number): Promise<boolean> {
    try {
      await this.amocrm.auth();
      const result = await firstValueFrom(
        this.httpService
          .post(`${this.amocrm.amocrmApiV2Domain}${AmocrmAPIV2.events}`, this.getEventsData(incomingNumber, eventResponsibleUserId), {
            headers: { Cookie: this.amocrm.authCookies },
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw error;
            }),
          ),
      );

      return !!result.data;
    } catch (e) {
      this.log.error(JSON.stringify(e), AmocrmV2Service.name);
      throw e;
    }
  }

  private getEventsData(incomingNumber: string, eventResponsibleUserId: number): string {
    const eventsData = JSON.stringify({
      add: [
        {
          type: 'phone_call',
          phone_number: UtilsService.formatIncomingNumber(incomingNumber),
          users: [eventResponsibleUserId],
        },
      ],
    });
    this.log.info(eventsData, AmocrmV2Service.name);
    return eventsData;
  }
}
