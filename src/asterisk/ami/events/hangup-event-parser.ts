import { Injectable } from '@nestjs/common';
import { LogService } from '@app/log/log.service';
import { AsteriskAmiEventProviderInterface, AsteriskHungupEvent } from '../interfaces/ami.interfaces';
import { DEFAULT_HANGUP_CDR_TIMEOUT, NOT_LOCAL_NUMBER } from '../ami.constants';
import { AsteriskCause } from '../interfaces/ami.enum';

@Injectable()
export class HangupEventParser implements AsteriskAmiEventProviderInterface {
    private checkCDR = true;
    constructor(private readonly log: LogService) {}

    async parseEvent(event: AsteriskHungupEvent): Promise<void> {
        try {

            return await this.parseHungupEvent(event);

        } catch (e) {

            this.log.error(event, HangupEventParser.name);

            throw e;

        }
    }

    private async parseHungupEvent(event: AsteriskHungupEvent): Promise<void> {
        if (
            this.checkCDR &&
            event.calleridnum.toString().length < NOT_LOCAL_NUMBER &&
            event.uniqueid == event.linkedid &&
            event.connectedlinenum.toString().length > NOT_LOCAL_NUMBER && [AsteriskCause.NORMAL_CLEARING, AsteriskCause.USER_BUSY, AsteriskCause.INTERWORKING].includes(event?.cause) &&
            event.connectedlinenum.toString() !== '<unknown>'
        ) {

            this.checkCDR = false;

            setTimeout(this.changeValueCDR, DEFAULT_HANGUP_CDR_TIMEOUT);

            this.log.info(`Исходящий ${event.uniqueid}`, HangupEventParser.name);

        } else if (
            this.checkCDR &&
            event.calleridnum.toString().length < NOT_LOCAL_NUMBER &&
            event.connectedlinenum.toString().length > NOT_LOCAL_NUMBER &&
            event.cause == AsteriskCause.NORMAL_CLEARING
        ) {

            this.checkCDR = false;

            setTimeout(this.changeValueCDR, DEFAULT_HANGUP_CDR_TIMEOUT);

            this.log.info(`Входящий ${event.linkedid}`, HangupEventParser.name);

        } else if (
            this.checkCDR &&
            event.calleridnum.toString().length > NOT_LOCAL_NUMBER &&
            event.uniqueid == event.linkedid &&
            event.connectedlinenum.toString().length > NOT_LOCAL_NUMBER && [AsteriskCause.NORMAL_CLEARING, AsteriskCause.USER_BUSY, AsteriskCause.INTERWORKING].includes(event?.cause) &&
            event.connectedlinenum.toString() !== '<unknown>'
        ) {

            this.checkCDR = false;

            setTimeout(this.changeValueCDR, DEFAULT_HANGUP_CDR_TIMEOUT);

            this.log.info(`Исходящий ${event.uniqueid}`, HangupEventParser.name);

        } else if (
            this.checkCDR &&
            event.calleridnum.toString().length > NOT_LOCAL_NUMBER &&
            event.uniqueid == event.linkedid &&
            event.connectedlinenum.toString().length < NOT_LOCAL_NUMBER &&
            event.cause == AsteriskCause.NORMAL_CLEARING
        ) {

            this.checkCDR = false;

            setTimeout(this.changeValueCDR, DEFAULT_HANGUP_CDR_TIMEOUT);

            this.log.info(`Входящий ${event.uniqueid}`, HangupEventParser.name);

        }
    }

    private changeValueCDR() {

        this.checkCDR = true;
        
    }
}