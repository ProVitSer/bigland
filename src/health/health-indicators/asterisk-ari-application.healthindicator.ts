import { AsteriskUtilsService } from '@app/asterisk/asterisk.utils';
import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { AsteriskEnvironmentVariables } from '@app/config/interfaces/config.interface';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import Ari from 'ari-client';

@Injectable()
export class AsteriskAriApplicationHealthIndicator extends HealthIndicator {
    private asteriskConfig = this.configService.get < AsteriskEnvironmentVariables > ('asterisk');

    constructor(
        @Inject(AsteriskAriProvider.aricall) private readonly ari: {
            ariClient: Ari.Client
        },
        private readonly configService: ConfigService,
    ) {
        super();
    }

    public async ping(key: string): Promise<HealthIndicatorResult> {
        try {

            const ariApplications = [AsteriskAriProvider.blacklist, AsteriskAriProvider.chanspy];

            const ariApplicationError = [];

            await Promise.all(
                ariApplications.map(async (application: AsteriskAriProvider) => {

                    const applicationConf = AsteriskUtilsService.getStasis(this.asteriskConfig.ari, application);

                    try {

                        await this.ari.ariClient.applications.get({
                            applicationName: applicationConf.stasis
                        });

                    } catch (e) {

                        ariApplicationError.push(applicationConf.stasis);

                    }
                }),
            );

            if (ariApplicationError.length !== 0) throw `application failed ${ariApplicationError.join(',')} `;

            return super.getStatus(key, true);

        } catch (e) {

            throw new HealthCheckError(`${key} failed`, this.getStatus(key, false, {
                message: e
            }));
            
        }
    }
}