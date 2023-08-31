import { AsteriskAriCall, AsteriskAriOriginate } from '../interfaces/ari.interfaces';
import { Injectable } from '@nestjs/common';
import { LogService } from '@app/log/log.service';
import { AsteriskContext, AsteriskOperatorTrunkName, ChannelType } from '../interfaces/ari.enum';
import { POZVONIM_PBX_ROUTE_EXTENSION } from '../ari.constants';

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
      extension: POZVONIM_PBX_ROUTE_EXTENSION,
      appArgs: 'dialed',
    };
  }
}
