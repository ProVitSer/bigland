import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import {
  GsmGatewayEventProviderInterface,
  ReceivedSMSEvent,
  SMSData,
} from '../interfaces/gsm-gateway-api.interfaces';
import {
  SmsStatusDescription,
  SmsType,
} from '../interfaces/gsm-gateway-api.enum';
import { LogService } from '@app/log/log.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class ReceivedSMSEventParser
  implements GsmGatewayEventProviderInterface
{
  constructor(
    private readonly sms: SmsService,
    private readonly log: LogService,
  ) {}

  async parseEvent(event: ReceivedSMSEvent): Promise<void> {
    try {
      return await this.parseReceivedSMSEvent(event);
    } catch (e) {
      this.log.error(String(event), ReceivedSMSEventParser.name);
    }
  }

  private async parseReceivedSMSEvent(event: ReceivedSMSEvent) {
    try {
      const { sender, gsmspan, content } = event;
      const smsInfo: SMSData = {
        unicid: UtilsService.generateId(true),
        mobileNumber: UtilsService.formatNumber(sender),
        gsmPort: gsmspan,
        smsText: decodeURI(content).replace(/\+/g, ' '),
        status: SmsStatusDescription.successful,
        type: SmsType.incoming,
      };
      await this.sms.addSmsInfo(smsInfo);
    } catch (e) {
      this.log.error(e, ReceivedSMSEventParser.name);
    }
  }
}
