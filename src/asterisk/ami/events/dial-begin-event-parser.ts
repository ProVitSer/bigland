import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { UtilsService } from '@app/utils/utils.service';
import { AsteriskAmiEventProviderInterface, AsteriskDialBeginEvent } from '../interfaces/ami.interfaces';
import { AmocrmV2ApiService } from '@app/amocrm/v2/services/amocrm-v2-api.service';
import { EVENT_INTERVAL, MIN_EXTERNAL_NUMBER_LENGTH } from '../ami.constants';

@Injectable()
export class DialBeginEventParser implements AsteriskAmiEventProviderInterface {
    constructor(
        private readonly log: LogService,
        private readonly amocrmV2ApiService: AmocrmV2ApiService,
        private readonly amocrmUsers: AmocrmUsersService,
    ) {}

    async parseEvent(event: AsteriskDialBeginEvent): Promise<void> {
        try {

            return await this.parseDialBeginEvent(event);

        } catch (e) {

            this.log.error(event, DialBeginEventParser.name);

            throw e;

        }
    }

    private async parseDialBeginEvent(event: AsteriskDialBeginEvent): Promise<void> {
        if (
            !!event.destcalleridnum &&
            event.destcalleridnum.toString().length == 3 &&
            event.calleridnum.toString().length >= MIN_EXTERNAL_NUMBER_LENGTH
        ) {

            this.log.info(event, DialBeginEventParser.name);

            const eventTimer = EVENT_INTERVAL.shift();

            EVENT_INTERVAL.push(eventTimer);

            await UtilsService.sleep(eventTimer);

            await this.sendEvent(event.destcalleridnum, event.calleridnum);

        }
    }

    private async sendEvent(localExtension: string, incomingNumber: string): Promise<void> {

        const resultSearchId = await this.amocrmUsers.getAmocrmUser(localExtension);

        if (!!resultSearchId[0]?.amocrmId) {
            await this.amocrmV2ApiService.sendIncomingCallEvent(incomingNumber, Number(resultSearchId[0]?.amocrmId));
        };
        
    }
}