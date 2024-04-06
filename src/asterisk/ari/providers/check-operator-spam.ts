import { AsteriskAriCall, AsteriskAriOriginate } from '../interfaces/ari.interfaces';
import { Injectable } from '@nestjs/common';
import { AmdSpamDataAdapter } from '../adapters/amd-call.adapter';
import { CheckSpamData } from '@app/spam-api/interfaces/spam-api.interfaces';
import { LogService } from '@app/log/log.service';

@Injectable()
export class CheckOperatorSpamAriCall implements AsteriskAriCall {
    constructor(private readonly log: LogService) {}

    async getOriginateInfo(data: CheckSpamData): Promise<AsteriskAriOriginate> {
        try {

            const spamDataAdapter = new AmdSpamDataAdapter({
                spamData: data.data,
                numberInfo: data.number,
                operatorInfo: {
                    amountOfNmber: data.operatorInfo.numbers.length,
                    formatNumber: data.operatorInfo.formatNumber,
                },
            });

            return spamDataAdapter.originateInfo;

        } catch (e) {

            this.log.error(e, CheckOperatorSpamAriCall.name);

            throw e;
            
        }
    }
}