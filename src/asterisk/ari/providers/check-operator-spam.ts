import { AsteriskAriOriginate } from '@app/asterisk/interfaces/asterisk.interfaces';
import { AsteriskAriCall } from '../interfaces/ari.interfaces';
import { Injectable } from '@nestjs/common';
import { OperatorsService } from '@app/operators/operators.service';
import { AmdSpamDataAdapter } from '../adapters/amd-call.adapter';
import { CheckSpamData } from '@app/spam-api/interfaces/spam-api.interfaces';

@Injectable()
export class CheckOperatorSpamAriCall implements AsteriskAriCall {
  constructor(private readonly operatorsService: OperatorsService) {}
  async getOriginateInfo(data: CheckSpamData): Promise<AsteriskAriOriginate> {
    try {
      const spamDataAdapter = new AmdSpamDataAdapter(data.data, data.number, {
        amountOfNmber: data.operatorInfo.numbers.length,
        formatNumber: data.operatorInfo.formatNumber,
      });
      return spamDataAdapter.originateInfo;
    } catch (e) {
      throw e;
    }
  }
}
