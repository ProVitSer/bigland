import { AmocrmAPIV4 } from '@app/amocrm/interfaces/amocrm.enum';
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { AMOCRM_PROBLEM } from '../health.constants';
import { AmocrmV4AuthService } from '@app/amocrm/v4/services/amocrm-v4-auth.service';

@Injectable()
export class AmocrmHealthIndicator extends HealthIndicator {
    constructor(private readonly amocrmV4AuthService: AmocrmV4AuthService) {
        super();
    }

    public async ping(key: string): Promise<HealthIndicatorResult> {
        try {

            const amocrmClient = this.amocrmV4AuthService.getAmocrmClient();

            const response = await amocrmClient.request.get(AmocrmAPIV4.account);

            if (!response.data.hasOwnProperty('id')) {
                throw AMOCRM_PROBLEM;
            };

            return super.getStatus(key, true);

        } catch (e) {

            throw new HealthCheckError(`${key} failed`, this.getStatus(key, false, {
                message: e
            }));
            
        }
    }
}