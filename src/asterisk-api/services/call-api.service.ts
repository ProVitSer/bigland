import { Injectable } from '@nestjs/common';
import { MonitoringCall, MonitoringCallResult, PozvominCall, PozvonimCallResult } from '../interfaces/asterisk-api.interfaces';
import { AriCallType } from '@app/asterisk/ari/interfaces/ari.enum';
import { AriCallService } from '@app/asterisk/ari/ari-call.service';

@Injectable()
export class CallApiService {
  constructor(private readonly ari: AriCallService) {}

  public async sendMonitoringCall(data: MonitoringCall): Promise<MonitoringCallResult[]> {
    try {
      const result: MonitoringCallResult[] = [];
      for (const number of data.numbers) {
        await this.ari.sendCall({ number }, AriCallType.monitoring);
        result.push({
          number,
          isCallSuccessful: true,
        });
      }
      return result;
    } catch (e) {
      throw e;
    }
  }

  public async pozvonimOutCall(data: PozvominCall): Promise<PozvonimCallResult> {
    try {
      const channelInfo = await this.ari.sendCall(data, AriCallType.pozvonim);
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
