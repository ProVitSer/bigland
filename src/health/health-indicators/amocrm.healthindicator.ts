import { AmocrmConnector } from '@app/amocrm/amocrm.connect';
import { AmocrmAPI } from '@app/amocrm/interfaces/amocrm.enum';
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { AMOCRM_PROBLEM } from '../health.constants';

@Injectable()
export class AmocrmHealthIndicator extends HealthIndicator {
  constructor(private readonly amocrmConnect: AmocrmConnector) {
    super();
  }
  public async ping(key: string): Promise<HealthIndicatorResult> {
    try {
      const amocrmClient = await this.amocrmConnect.getAmocrmClient();
      const response = await amocrmClient.request.get(AmocrmAPI.account);
      if (!response.data.hasOwnProperty('id')) {
        throw AMOCRM_PROBLEM;
      }
      return super.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError(`${key} failed`, this.getStatus(key, false, { message: e }));
    }
  }
}
