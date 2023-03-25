import { AriActionService } from '@app/asterisk/ari/action-service';
import { NumbersInfo } from '@app/operators/operators.schema';
import { OperatorsService } from '@app/operators/operators.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AsterikkApi } from '../asterisk-api.schema';
import { AsteriskApiActionStatus } from '../interfaces/asterisk-api.enum';
import {
  AsteriskApiCheckSpamData,
  MonitoringCall,
  MonitoringCallResult,
  PozvominCall,
  PozvonimCallResult,
} from '../interfaces/asterisk-api.interfaces';
import { UtilsService } from '@app/utils/utils.service';

@Injectable()
export class CallApiService {
  constructor(
    private readonly ari: AriActionService,
    private readonly operatorsService: OperatorsService,
    @InjectModel(AsterikkApi.name) private asteriskApiModel: Model<AsterikkApi>,
  ) {}

  public async sendMonitoringCall(data: MonitoringCall): Promise<MonitoringCallResult[]> {
    try {
      const result: MonitoringCallResult[] = [];
      for (const number of data.numbers) {
        await this.ari.monitoringOutboundCall(number, data.description);
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

  public async checkSpam(data: AsteriskApiCheckSpamData): Promise<any> {
    try {
      const operatorInfo = await this.operatorsService.getOperator(data.operator);
      for (const number of operatorInfo.numbers) {
        await UtilsService.sleep(20000);
        if (!number.isActive) return;
        await this.ari.amdCall({
          amountOfNmber: operatorInfo.numbers.length,
          asteriskApiId: data.asteriskApiId.toString(),
          localExtension: data.localExtension,
          dstNumber: data.dstNumber,
          callerId: number.callerId,
          outSuffix: number.outSuffix,
        });
      }
      return;
      // await Promise.all(
      //   operatorInfo.numbers.map(async (number: NumbersInfo) => {
      //     if (!number.isActive) return;
      //     await this.ari.amdCall({
      //       amountOfNmber: operatorInfo.numbers.length,
      //       asteriskApiId: data.asteriskApiId.toString(),
      //       localExtension: data.localExtension,
      //       dstNumber: data.dstNumber,
      //       callerId: number.callerId,
      //       outSuffix: number.outSuffix,
      //     });
      //   }),
      // );
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
