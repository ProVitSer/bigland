import { AriACallService } from '@app/asterisk/ari/call.service';
import { OperatorsService } from '@app/operators/operators.service';
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
import { UtilsService } from '@app/utils/utils.service';
import { AmdSpamDataAdapter } from '@app/asterisk/ari/adapters/amd-call.adapter';
import { NUMBER_IS_NOT_ACTIVE, NUMBER_NOT_FOUND, SEND_CALL_CHECK_SPAM } from '../asterisk-api.constants';
import { NumbersInfo } from '@app/operators/operators.schema';

@Injectable()
export class CallApiService {
  constructor(
    private readonly ari: AriACallService,
    private readonly operatorsService: OperatorsService,
    @InjectModel(AsterikkApi.name) private asteriskApiModel: Model<AsterikkApi>,
  ) {}

  public async sendMonitoringCall(data: MonitoringCall): Promise<MonitoringCallResult[]> {
    try {
      const result: MonitoringCallResult[] = [];
      for (const number of data.numbers) {
        await this.ari.monitoringOutboundCall(number);
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

  public async checkNumberForSpam(data: AsteriskApiCheckNumberSpamData): Promise<void> {
    try {
      const operatorInfo = await this.operatorsService.getOperator(data.operator);
      if (!operatorInfo.numbers.some((number: NumbersInfo) => number.callerId === data.callerId)) throw new Error(NUMBER_NOT_FOUND);
      const numberInfo = operatorInfo.numbers.filter((number: NumbersInfo) => number.callerId === data.callerId);
      if (!numberInfo[0].isActive) throw new Error(NUMBER_IS_NOT_ACTIVE);

      await this.ari.amdCheckSpamCall(
        new AmdSpamDataAdapter(data, numberInfo[0], {
          amountOfNmber: 1,
          formatNumber: operatorInfo.formatNumber,
        }),
      );
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
        if (!number.isActive) throw new Error(NUMBER_IS_NOT_ACTIVE);
        await this.ari.amdCheckSpamCall(
          new AmdSpamDataAdapter(data, number, {
            amountOfNmber: operatorInfo.numbers.length,
            formatNumber: operatorInfo.formatNumber,
          }),
        );
      }

      return;
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
