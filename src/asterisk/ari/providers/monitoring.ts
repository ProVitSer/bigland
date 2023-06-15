import { AsteriskAriOriginate } from '@app/asterisk/interfaces/asterisk.interfaces';
import { AsteriskAriCall } from '../interfaces/ari.interfaces';
import { AsteriskContext, AsteriskOperatorTrunkName, ChannelType } from '@app/asterisk/interfaces/asterisk.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MonitoringAriCall implements AsteriskAriCall {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async getOriginateInfo(data: { number: string }): Promise<AsteriskAriOriginate> {
    try {
    } catch (e) {
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
