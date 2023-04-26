import { GsmSendSMSActionService } from '@app/gsm-gateway-api/gsm/gsm-action-service';
import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Sms } from './sms.schema';

@Injectable()
export class SendSmsScheduleService {
  constructor(private readonly gsmSendSMSAction: GsmSendSMSActionService, private readonly log: LogService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendScheduledSms() {
    try {
      const scheduledSms = await this.gsmSendSMSAction.getScheduledSend();
      await Promise.all(
        scheduledSms.map(async (sms: Sms) => {
          await this.gsmSendSMSAction.send(sms);
        }),
      );
    } catch (e) {
      this.log.error(e, SendSmsScheduleService.name);
    }
  }
}
