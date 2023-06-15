import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AsterikkApi } from '../asterisk-api.schema';
import { AsteriskApiActionStatus } from '../interfaces/asterisk-api.enum';
import {
  AsteriskApiCheckNumberSpamData,
  AsteriskApiCheckOperatorSpamData,
  MonitoringCall,
  MonitoringCallResult,
  PozvominCall,
  PozvonimCallResult,
} from '../interfaces/asterisk-api.interfaces';
import { AriCallType } from '@app/asterisk/ari/interfaces/ari.enum';
import { OperatorsService } from '@app/operators/operators.service';
import { UtilsService } from '@app/utils/utils.service';
import { SEND_CALL_CHECK_SPAM } from '../asterisk-api.constants';
import { AriACallService } from '@app/asterisk/ari/ari-call.service';

@Injectable()
export class CallApiService {
  constructor(
    private readonly ari: AriACallService,
    @InjectModel(AsterikkApi.name) private asteriskApiModel: Model<AsterikkApi>,
    private readonly operatorsService: OperatorsService,
  ) {}

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

  public async checkNumberForSpam(data: AsteriskApiCheckNumberSpamData): Promise<void> {
    try {
      await this.ari.sendCall(data, AriCallType.checkSpamNumber);
    } catch (e) {
      await this.asteriskApiModel.updateOne(
        { _id: data.asteriskApiId },
        {
          $set: {
            status: AsteriskApiActionStatus.apiFail,
            resultData: {
              error: e.message || e,
            },
          },
        },
      );
    }
  }

  public async checkOperatorNumberForSpam(data: AsteriskApiCheckOperatorSpamData): Promise<void> {
    try {
      const operatorInfo = await this.operatorsService.getOperator(data.operator);
      for (const number of operatorInfo.numbers) {
        await UtilsService.sleep(SEND_CALL_CHECK_SPAM);
        await this.ari.sendCall({ number, operatorInfo, data }, AriCallType.checkOperatorSpam);
      }
    } catch (e) {
      await this.asteriskApiModel.updateOne(
        { _id: data.asteriskApiId },
        {
          $set: {
            status: AsteriskApiActionStatus.apiFail,
            resultData: {
              error: e.message || e,
            },
          },
        },
      );
    }
  }
}
