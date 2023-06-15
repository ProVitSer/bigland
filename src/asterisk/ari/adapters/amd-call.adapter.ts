import { AsteriskAriOriginate, OperatorInfo } from '@app/asterisk/interfaces/asterisk.interfaces';
import { NumbersInfo } from '@app/operators/operators.schema';
import { OperatorsUtils } from '@app/operators/operators.utils';
import { AsteriskContext, ChannelType } from '../../interfaces/asterisk.enum';
import { SpamData } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';

export class AmdSpamDataAdapter {
  originateInfo: AsteriskAriOriginate;
  checkSpamData: SpamData;
  constructor(data: SpamData, number: NumbersInfo, operatorInfo: OperatorInfo) {
    const { dstNumber, callerId } = OperatorsUtils.formatOperatorNumber(operatorInfo.formatNumber, data.dstNumber, String(number.callerId));
    this.checkSpamData = data;
    this.originateInfo = {
      endpoint: `${ChannelType.PJSIP}/${data.localExtension}`,
      extension: data.localExtension,
      callerId,
      context: AsteriskContext.amdCheckSpam,
      variables: {
        callerId,
        outSuffix: number.outSuffix,
        amountOfNmber: String(operatorInfo.amountOfNmber),
        asteriskApiId: data.asteriskApiId.toString(),
        dstNumber,
      },
    };
  }
}
