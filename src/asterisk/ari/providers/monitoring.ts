import { AsteriskAriOriginate } from '@app/asterisk/interfaces/asterisk.interfaces';
import { AsteriskAriCall } from '../interfaces/ari.interfaces';
import { AsteriskContext, AsteriskOperatorTrunkName, ChannelType } from '@app/asterisk/interfaces/asterisk.enum';
import { Injectable } from '@nestjs/common';
import { LogService } from '@app/log/log.service';

@Injectable()
export class MonitoringAriCall implements AsteriskAriCall {
  constructor(private readonly log: LogService) {}

  public async getOriginateInfo(data: { number: string }): Promise<AsteriskAriOriginate> {
    try {
    } catch (e) {
      this.log.error(e, MonitoringAriCall.name);

      throw e;
    }
    return {
      endpoint: `${ChannelType.PJSIP}/${data.number}@${AsteriskOperatorTrunkName.monitoring}`,
      context: AsteriskContext.monitoring,
      extension: '2222',
      appArgs: 'dialed',
    };
  }
}
