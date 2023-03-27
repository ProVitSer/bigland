import { AsteriskAriOriginate } from '@app/asterisk/interfaces/asterisk.interfaces';
import { NumbersInfo, Operators } from '@app/operators/operators.schema';
import { OperatorsUtils } from '@app/operators/operators.utils';
import { AsteriskApiCheckSpamData } from '../../asterisk-api/interfaces/asterisk-api.interfaces';
import { AMD_OUTBOUND_CALL } from '../asterisk.config';
import { ChannelType } from '../interfaces/asterisk.enum';

export class AmdCallDataAdapter {
  originateInfo: AsteriskAriOriginate;
  checkSpamData: AsteriskApiCheckSpamData;
  constructor(data: AsteriskApiCheckSpamData, number: NumbersInfo, operator: Operators) {
    const { dstNumber, callerId } = OperatorsUtils.formatOperatorNumber(operator, data.dstNumber, String(number.callerId));
    this.checkSpamData = data;
    this.originateInfo = {
      endpoint: `${ChannelType.PJSIP}/${data.localExtension}`,
      extension: data.localExtension,
      callerId,
      ...AMD_OUTBOUND_CALL,
      variables: {
        callerId,
        outSuffix: number.outSuffix,
        amountOfNmber: operator.numbers.length,
        asteriskApiId: data.asteriskApiId.toString(),
        dstNumber,
      },
    };
  }
}
