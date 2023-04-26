import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { Inject, Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import Ari from 'ari-client';

@Injectable()
export class AsteriskHealthIndicator extends HealthIndicator {
  constructor(@Inject(AsteriskAriProvider.chanspy) private readonly ari: { ariClient: Ari.Client }) {
    super();
  }

  public async ping(key: string): Promise<HealthIndicatorResult> {
    try {
      return new Promise((resolve) => {
        this.ari.ariClient.on('pong', () => {
          resolve(super.getStatus(key, true));
        });
        this.ari.ariClient.ping();
      });
    } catch (e) {
      throw new HealthCheckError(`${key} failed`, this.getStatus(key, false, { message: e }));
    }
  }
}
