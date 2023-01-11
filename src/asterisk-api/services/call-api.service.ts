import { AmiActionService } from '@app/asterisk/ami/action-service';
import { AriActionService } from '@app/asterisk/ari/action-service';
import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { MonitoringCall, MonitoringCallResult, PozvominCall, PozvonimCallResult } from '../interfaces/asterisk-api.interfaces';

@Injectable()
export class CallApiService {
  constructor(private readonly ami: AmiActionService, private readonly ari: AriActionService, private readonly log: LogService) {}

  public async sendMonitoringCall(data: MonitoringCall): Promise<MonitoringCallResult[]> {
    try {
      const result: MonitoringCallResult[] = [];
      await Promise.all(
        data.numbers.map(async (number: string) => {
          await this.ari.sendAriCall(number);
          result.push({
            number,
            isCallSuccessful: true,
          });
        }),
      );
      return result;
    } catch (e) {
      throw e;
    }
  }

  public async pozvonimOutCall(data: PozvominCall): Promise<PozvonimCallResult> {
    try {
      const channelInfo = await this.ari.pozvonimOutboundCall(data);
      return {
        number: data.DST_NUM,
        isCallSuccessful: true,
        channelId: channelInfo.id,
      };
    } catch (e) {
      throw e;
    }
  }
}
