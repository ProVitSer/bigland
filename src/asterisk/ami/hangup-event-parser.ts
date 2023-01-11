import { Injectable } from '@nestjs/common';
import { AsteriskAmiEventProviderInterface, AsteriskHungupEvent } from '../interfaces/asterisk.interfaces';
import { AsteriskCause } from '../interfaces/asterisk.enum';
import { LogService } from '@app/log/log.service';

let checkCDR = true;

@Injectable()
export class HangupEventParser implements AsteriskAmiEventProviderInterface {
  constructor(private readonly log: LogService) {}

  async parseEvent(event: AsteriskHungupEvent): Promise<void> {
    try {
      return await this.parseHungupEvent(event);
    } catch (e) {
      this.log.error(String(event), HangupEventParser.name);
    }
  }

  private async parseHungupEvent(event: AsteriskHungupEvent): Promise<void> {
    if (
      checkCDR &&
      event.calleridnum.toString().length < 4 &&
      event.uniqueid == event.linkedid &&
      event.connectedlinenum.toString().length > 4 &&
      [AsteriskCause.NORMAL_CLEARING, AsteriskCause.USER_BUSY, AsteriskCause.INTERWORKING].includes(event?.cause) &&
      event.connectedlinenum.toString() !== '<unknown>'
    ) {
      checkCDR = false;
      setTimeout(this.changeValueCDR, 1000);
      this.log.info(`Исходящий ${event.uniqueid}`, HangupEventParser.name);
    } else if (
      checkCDR &&
      event.calleridnum.toString().length < 4 &&
      event.connectedlinenum.toString().length > 4 &&
      event.cause == AsteriskCause.NORMAL_CLEARING
    ) {
      checkCDR = false;
      setTimeout(this.changeValueCDR, 1000);
      this.log.info(`Входящий ${event.linkedid}`, HangupEventParser.name);
    } else if (
      checkCDR &&
      event.calleridnum.toString().length > 4 &&
      event.uniqueid == event.linkedid &&
      event.connectedlinenum.toString().length > 4 &&
      [AsteriskCause.NORMAL_CLEARING, AsteriskCause.USER_BUSY, AsteriskCause.INTERWORKING].includes(event?.cause) &&
      event.connectedlinenum.toString() !== '<unknown>'
    ) {
      checkCDR = false;
      setTimeout(this.changeValueCDR, 1000);
      this.log.info(`Исходящий ${event.uniqueid}`, HangupEventParser.name);
    } else if (
      checkCDR &&
      event.calleridnum.toString().length > 4 &&
      event.uniqueid == event.linkedid &&
      event.connectedlinenum.toString().length < 4 &&
      event.cause == AsteriskCause.NORMAL_CLEARING
    ) {
      checkCDR = false;
      setTimeout(this.changeValueCDR, 1000);
      this.log.info(`Входящий ${event.uniqueid}`, HangupEventParser.name);
    }
  }

  private changeValueCDR() {
    checkCDR = true;
  }
}
