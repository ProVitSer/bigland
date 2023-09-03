import { AsteriskAriCall, AsteriskAriOriginate } from '../interfaces/ari.interfaces';
import { Injectable } from '@nestjs/common';
import { LogService } from '@app/log/log.service';
import { AsteriskContext, ChannelType } from '../interfaces/ari.enum';
import { MONITORING_CALL_LOCAL_PREFIX, POZVONIM_PBX_ROUTE_EXTENSION } from '../ari.constants';

@Injectable()
export class MonitoringAriCall implements AsteriskAriCall {
  constructor(private readonly log: LogService) {}

  public async getOriginateInfo(data: { number: string }): Promise<AsteriskAriOriginate> {
    return {
      endpoint: `${ChannelType.LOCAL}/${MONITORING_CALL_LOCAL_PREFIX}${data.number}@${AsteriskContext.fromInternalAdditional}`,
      context: AsteriskContext.monitoring,
      extension: POZVONIM_PBX_ROUTE_EXTENSION,
      appArgs: 'dialed',
    };
  }
}
