import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LogService } from '@app/log/log.service';
import { UtilsService } from '@app/utils/utils.service';
import { AmocrmAPIV2, AmocrmV2EventType } from '../../interfaces/amocrm.enum';
import { AmocrmV2AuthService } from './amocrm-v2-auth.service';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class AmocrmV2ApiService {
  constructor(private readonly amocrm: AmocrmV2AuthService, private readonly log: LogService, private httpService: HttpService) {}

  public async sendIncomingCallEvent(incomingNumber: string, eventResponsibleUserId: number): Promise<boolean> {
    try {
      const result = await firstValueFrom(
        this.httpService
          .post(
            `${this.amocrm.amocrmConfig.v2.apiV2Domain}${AmocrmAPIV2.events}`,
            this.getEventsData(incomingNumber, eventResponsibleUserId),
            {
              headers: { Cookie: await this.amocrm.getAuthCookies() },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              throw error;
            }),
          ),
      );

      return !!result.data;
    } catch (e) {
      this.log.error(e, AmocrmV2ApiService.name);
      throw e;
    }
  }

  private getEventsData(incomingNumber: string, eventResponsibleUserId: number): string {
    const eventsData = JSON.stringify({
      add: [
        {
          type: AmocrmV2EventType.phoneCall,
          phone_number: UtilsService.formatIncomingNumber(incomingNumber),
          users: [eventResponsibleUserId],
        },
      ],
    });
    this.log.info(eventsData, AmocrmV2ApiService.name);
    return eventsData;
  }
}
