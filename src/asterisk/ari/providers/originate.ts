import { AsteriskAriCall, AsteriskAriOriginate } from '../interfaces/ari.interfaces';
import { Injectable } from '@nestjs/common';
import { LogService } from '@app/log/log.service';
import { OriginateCallDTO } from '@app/asterisk-api/dto/originate.dto';
import { AsteriskContext, ChannelType } from '../interfaces/ari.enum';

@Injectable()
export class OriginateCall implements AsteriskAriCall {
    constructor(private readonly log: LogService) {}

    async getOriginateInfo(data: OriginateCallDTO): Promise<AsteriskAriOriginate> {
        try {


            return {
                endpoint: `${ChannelType.LOCAL}/${data.src_number}@${AsteriskContext.fromInternalAdditional}`,
                callerId: data.dst_number,
                context: AsteriskContext.apiOriginate,
                extension: data.src_number,
                variables: {
                    dstLocalExtension: data.dst_number,
                },
            };


        } catch (e) {

            this.log.error(e, OriginateCall.name);

            throw e;
            
        }
    }
}