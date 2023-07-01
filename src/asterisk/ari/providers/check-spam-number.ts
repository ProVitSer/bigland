import { AsteriskAriOriginate } from '@app/asterisk/interfaces/asterisk.interfaces';
import { AsteriskAriCall } from '../interfaces/ari.interfaces';
import { Injectable } from '@nestjs/common';
import { OperatorsService } from '@app/operators/operators.service';
import { NumbersInfo, Operators } from '@app/operators/operators.schema';
import { AmdSpamDataAdapter } from '../adapters/amd-call.adapter';
import { NUMBER_IS_NOT_ACTIVE, NUMBER_NOT_FOUND } from '@app/asterisk-api/asterisk-api.constants';
import { CheckNumberSpamData } from '@app/spam-api/interfaces/spam-api.interfaces';

@Injectable()
export class CheckSpamNumberAriCall implements AsteriskAriCall {
  constructor(private readonly operatorsService: OperatorsService) {}
  async getOriginateInfo(data: CheckNumberSpamData): Promise<AsteriskAriOriginate> {
    try {
      const operatorInfo = await this.getOperatorInfo(data);
      const number = this.getActiveNumber(data, operatorInfo);
      const spamDataAdapter = new AmdSpamDataAdapter(data, number, {
        amountOfNmber: 1,
        formatNumber: operatorInfo.formatNumber,
      });
      console.log(JSON.stringify(spamDataAdapter.originateInfo));
      return spamDataAdapter.originateInfo;
    } catch (e) {
      throw e;
    }
  }

  private getActiveNumber(data: CheckNumberSpamData, operatorInfo: Operators): NumbersInfo {
    const numberInfo = operatorInfo.numbers.filter((number: NumbersInfo) => number.callerId === data.callerId);
    if (!numberInfo[0].isActive) throw new Error(NUMBER_IS_NOT_ACTIVE);
    return numberInfo[0];
  }

  private async getOperatorInfo(data: CheckNumberSpamData): Promise<Operators> {
    const operatorInfo = await this.operatorsService.getOperator(data.operator);
    if (!operatorInfo.numbers.some((number: NumbersInfo) => number.callerId === data.callerId)) throw new Error(NUMBER_NOT_FOUND);
    return operatorInfo;
  }
}
