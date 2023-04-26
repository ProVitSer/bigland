import { AmocrmV4Connector } from '@app/amocrm/v4/amocrm-v4.connect';
import { AmocrmAPIV4 } from '@app/amocrm/interfaces/amocrm.enum';
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { AMOCRM_PROBLEM } from '../health.constants';

@Injectable()
export class AmocrmHealthIndicator extends HealthIndicator {
  constructor(private readonly amocrmConnect: AmocrmV4Connector) {
    super();
  }
  public async ping(key: string): Promise<HealthIndicatorResult> {
    try {
      const amocrmClient = this.amocrmConnect.getAmocrmClient();
      const response = await amocrmClient.request.get(AmocrmAPIV4.account);
      if (!response.data.hasOwnProperty('id')) {
        throw AMOCRM_PROBLEM;
      }
      return super.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError(`${key} failed`, this.getStatus(key, false, { message: e }));
    }
  }
}
