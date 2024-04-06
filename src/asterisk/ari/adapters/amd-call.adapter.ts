import { OperatorsUtils } from '@app/operators/operators.utils';
import { DEFAULT_LOCAL_EXTENSION } from '../ari.constants';
import { SpamData } from '@app/spam-api/interfaces/spam-api.interfaces';
import { AmdSpamData, AsteriskAriOriginate } from '../interfaces/ari.interfaces';
import { AsteriskContext, ChannelType } from '../interfaces/ari.enum';

export class AmdSpamDataAdapter {
    originateInfo: AsteriskAriOriginate;
    checkSpamData: SpamData;
    constructor(data: AmdSpamData) {

        const localExtension = !!data.spamData.localExtension ? data.spamData.localExtension : DEFAULT_LOCAL_EXTENSION;

        const {
            dstNumber,
            callerId
        } = OperatorsUtils.formatOperatorNumber(
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