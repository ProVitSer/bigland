import { AsteriskAriOriginate } from '@app/asterisk/interfaces/asterisk.interfaces';
import { OperatorsUtils } from '@app/operators/operators.utils';
import { AsteriskContext, ChannelType } from '../../interfaces/asterisk.enum';
import { DEFAULT_LOCAL_EXTENSION } from '../ari.constants';
import { SpamData } from '@app/spam-api/interfaces/spam-api.interfaces';
import { AmdSpamData } from '../interfaces/ari.interfaces';

export class AmdSpamDataAdapter {
  originateInfo: AsteriskAriOriginate;
  checkSpamData: SpamData;
  constructor(data: AmdSpamData) {
    const localExtension = !!data.spamData.localExtension ? data.spamData.localExtension : DEFAULT_LOCAL_EXTENSION;
    const { dstNumber, callerId } = OperatorsUtils.formatOperatorNumber(
      data.operatorInfo.formatNumber,
      data.spamData.dstNumber,
      String(data.numberInfo.callerId),
    );
    this.checkSpamData = data.spamData;
    this.originateInfo = {
      endpoint: `${ChannelType.LOCAL}/${localExtension}@${AsteriskContext.fromInternalAdditional}`,
      extension: localExtension,
      callerId,
      context: AsteriskContext.amdCheckSpam,
      variables: {
        callerId,
        outSuffix: data.numberInfo.outSuffix,
        amountOfNmber: String(data.operatorInfo.amountOfNmber),
        applicationId: data.spamData.applicationId.toString(),
        dstNumber,
        operator: data.spamData.operator,
      },
    };
  }
}
