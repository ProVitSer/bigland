import { Injectable } from '@nestjs/common';
import {
  GsmGatewayEventProviderInterface,
  SendSMSStatus,
  SmsSendStatusMap,
  UpdateSMSData,
  UpdateSMSSendEvent,
} from '../interfaces/gsm-gateway-api.interfaces';
import { SmsType } from '../interfaces/gsm-gateway-api.enum';
import { LogService } from '@app/log/log.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class UpdateSMSSendEventParser implements GsmGatewayEventProviderInterface {
  constructor(private readonly sms: SmsService, private readonly log: LogService) {}

  async parseEvent(event: UpdateSMSSendEvent): Promise<void> {
    try {
      return await this.parseUpdateSMSEvent(event);
    } catch (e) {
      this.log.error(String(event), UpdateSMSSendEventParser.name);
    }
  }

  private async parseUpdateSMSEvent(event: UpdateSMSSendEvent) {
    try {
      const updateInfo: UpdateSMSData = {
        status: SmsSendStatusMap[event.status as SendSMSStatus],
        type: SmsType.outgoing,
      };
      await this.sms.updateSmsStatusById(event.id, updateInfo);
    } catch (e) {
      this.log.error(e, UpdateSMSSendEventParser.name);
    }
  }
}
