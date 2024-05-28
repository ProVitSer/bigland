import { AsteriskAriCall, AsteriskAriOriginate } from '../interfaces/ari.interfaces';
import { Injectable } from '@nestjs/common';
import { LogService } from '@app/log/log.service';
import { AsteriskContext, ChannelType } from '../interfaces/ari.enum';
import { OriginateCallData } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';

@Injectable()
export class OriginateCall implements AsteriskAriCall {
    constructor(private readonly log: LogService) {}

    async getOriginateInfo(data: OriginateCallData): Promise<AsteriskAriOriginate> {
        try {


            return {
                endpoint: `${ChannelType.LOCAL}/${data.dstNumber}@${AsteriskContext.fromInternalAdditional}`,
                callerId: data.srcNumber,
                context: AsteriskContext.apiOriginate,
                extension: data.dstNumber,
                otherChannelId: data.srcChannelId,
                variables: {
                    dstLocalExtension: data.srcNumber,
                },
            };


        } catch (e) {

            this.log.error(e, OriginateCall.name);

            throw e;
            
        }
    }
}