import { AsteriskAriOriginate, OperatorInfo } from '@app/asterisk/interfaces/asterisk.interfaces';
import { NumbersInfo } from '@app/operators/operators.schema';
import { OperatorsUtils } from '@app/operators/operators.utils';
import { AsteriskContext, ChannelType } from '../../interfaces/asterisk.enum';
import { DEFAULT_LOCAL_EXTENSION } from '../ari.constants';
import { SpamData } from '@app/spam-api/interfaces/spam-api.interfaces';

export class AmdSpamDataAdapter {
  originateInfo: AsteriskAriOriginate;
  checkSpamData: SpamData;
  constructor(data: SpamData, number: NumbersInfo, operatorInfo: OperatorInfo) {
    const localExtension = !!data.localExtension ? data.localExtension : DEFAULT_LOCAL_EXTENSION;
    const { dstNumber, callerId } = OperatorsUtils.formatOperatorNumber(operatorInfo.formatNumber, data.dstNumber, String(number.callerId));
    this.checkSpamData = data;
    this.originateInfo = {
      endpoint: `${ChannelType.LOCAL}/${localExtension}@${AsteriskContext.fromInternalAdditional}`,
      extension: localExtension,
      callerId,
      context: AsteriskContext.amdCheckSpam,
      variables: {
        callerId,
        outSuffix: number.outSuffix,
        amountOfNmber: String(operatorInfo.amountOfNmber),
        applicationId: data.applicationId.toString(),
        dstNumber,
        operator: data.operator,
      },
    };
  }
}
