import { AsteriskAriCall, AsteriskAriOriginate } from '../interfaces/ari.interfaces';
import { Injectable } from '@nestjs/common';
import { OperatorsService } from '@app/operators/operators.service';
import { NumbersInfo, Operators } from '@app/operators/operators.schema';
import { AmdSpamDataAdapter } from '../adapters/amd-call.adapter';
import { NUMBER_NOT_FOUND } from '@app/asterisk-api/asterisk-api.constants';
import { CheckNumberSpamData } from '@app/spam-api/interfaces/spam-api.interfaces';
import { AMOUNT_NUMBER } from '../ari.constants';
import { LogService } from '@app/log/log.service';

@Injectable()
export class CheckSpamNumberAriCall implements AsteriskAriCall {
  constructor(private readonly operatorsService: OperatorsService, private readonly log: LogService) {}

  public async getOriginateInfo(data: CheckNumberSpamData): Promise<AsteriskAriOriginate> {
    try {
      const operatorInfo = await this.getOperatorInfo(data);
      const number = this.getActiveNumber(data, operatorInfo);
      const spamDataAdapter = new AmdSpamDataAdapter({
        spamData: data,
        numberInfo: number,
        operatorInfo: {
          amountOfNmber: AMOUNT_NUMBER,
          formatNumber: operatorInfo.formatNumber,
        },
      });
      return spamDataAdapter.originateInfo;
    } catch (e) {
      this.log.error(e, CheckSpamNumberAriCall.name);
      throw e;
    }
  }

  private getActiveNumber(data: CheckNumberSpamData, operatorInfo: Operators): NumbersInfo {
    const numberInfo = operatorInfo.numbers.filter((number: NumbersInfo) => number.callerId === data.callerId);
    return numberInfo[0];
  }

  private async getOperatorInfo(data: CheckNumberSpamData): Promise<Operators> {
    const operatorInfo = await this.operatorsService.getOperator(data.operator);
    if (!operatorInfo.numbers.some((number: NumbersInfo) => number.callerId === data.callerId)) throw new Error(NUMBER_NOT_FOUND);
    return operatorInfo;
  }
}
