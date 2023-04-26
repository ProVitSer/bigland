import { GsmGateway } from '@app/gsm-gateway-api/gsm-gateway';
import { GsmPingEvent } from '@app/gsm-gateway-api/interfaces/gsm-gateway-api.interfaces';
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as namiLib from 'nami';
import { GSM_PROBLEM } from '../health.constants';

@Injectable()
export class GsmGatewayHealthIndicator extends HealthIndicator {
  constructor(private readonly gsmGateway: GsmGateway) {
    super();
  }
  public async ping(key: string): Promise<HealthIndicatorResult> {
    try {
      const action = new namiLib.Actions.Ping();
      const pong = await this.gsmGateway.gmsClientSend<GsmPingEvent>(action);
      if (!!pong?.ping) return super.getStatus(key, true);
      throw GSM_PROBLEM;
    } catch (e) {
      throw new HealthCheckError(`${key} failed`, this.getStatus(key, false, { message: e }));
    }
  }
}
