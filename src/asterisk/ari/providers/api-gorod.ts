import { AsteriskAriCall, AsteriskAriOriginate } from '../interfaces/ari.interfaces';
import { Injectable } from '@nestjs/common';
import { LogService } from '@app/log/log.service';
import { AsteriskContext, ChannelType } from '../interfaces/ari.enum';
import { ApiCall } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';

@Injectable()
export class ApiGorodAriCall implements AsteriskAriCall {
    public readonly accountcode: string = 'ApiGorod';

    constructor(private readonly log: LogService) {}

    async getOriginateInfo(data: ApiCall): Promise<AsteriskAriOriginate> {
        try {


            return {
                endpoint: `${ChannelType.LOCAL}/${data.sip_id}@${AsteriskContext.fromInternalAdditional}`,
                callerId: data.sip_id,
                context: AsteriskContext.apiGorod,
                extension: data.sip_id,
                variables: {
                    dstNumber: data.dst_number,
                    accountcode: this.accountcode,
                    localExtension: data.sip_id
                },
            };


        } catch (e) {

            this.log.error(e, ApiGorodAriCall.name);

            throw e;
            
        }
    }
}