import { AsteriskAriOriginate } from '@app/asterisk/interfaces/asterisk.interfaces';
import { AsteriskAriCall } from '../interfaces/ari.interfaces';
import { CheckOperatorSpamData } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { Injectable } from '@nestjs/common';
import { OperatorsService } from '@app/operators/operators.service';
import { AmdSpamDataAdapter } from '../adapters/amd-call.adapter';

@Injectable()
export class CheckOperatorSpamAriCall implements AsteriskAriCall {
  constructor(private readonly operatorsService: OperatorsService) {}
  async getOriginateInfo(data: CheckOperatorSpamData): Promise<AsteriskAriOriginate> {
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
