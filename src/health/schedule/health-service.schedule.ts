import { HealthMailEnvironmentVariables } from '@app/config/interfaces/config.interface';
import { HealthService } from '@app/health/health.service';
import { LogService } from '@app/log/log.service';
import { TemplateTypes } from '@app/mail/interfaces/mail.enum';
import { MailService } from '@app/mail/mail.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HEALTH_ERROR_SCHEDULE, HEALTH_MAIL_ERROR } from '../health.constants';
import { HealthCheckStatusType, ReturnHealthFormatType } from '../interfaces/health.enum';
import { HealthCheckMailFormat, MailSendInfo } from '../interfaces/health.interface';
import { SendMailData } from '@app/mail/interfaces/mail.interfaces';

@Injectable()
export class HealthScheduledService {
  private mailSendInfo: MailSendInfo;
  private serviceContext: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly health: HealthService,
    private readonly mail: MailService,
  ) {
    this.serviceContext = HealthScheduledService.name;
    this.mailSendInfo = {
      isScheduledSend: false,
      lastCheckStatus: HealthCheckStatusType.ok,
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sendScheduled() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      try {
        const result = await this.health.check<HealthCheckMailFormat>(ReturnHealthFormatType.mail);
        this.log.info(result, this.serviceContext);
        if (this.checkSendMail(result.status)) {
          this.mailSendInfo.isScheduledSend = true;
          this.mailSendInfo.lastCheckStatus = result.status;
          return await this.sendMailInfo(result);
        }
      } catch (e) {
        this.log.error(`${HEALTH_ERROR_SCHEDULE} ${e}`, this.serviceContext);
      }
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  enableMailSend() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      return (this.mailSendInfo.isScheduledSend = false);
    }
  }

  private async sendMailInfo(healthResult: HealthCheckMailFormat): Promise<void> {
    try {
      const sendMailInfo = this.getSendMailInfoData(healthResult);
      return await this.mail.sendMail(sendMailInfo);
    } catch (e) {
      this.log.error(`${HEALTH_MAIL_ERROR} ${e}`, this.serviceContext);
    }
  }

  private checkSendMail(healthStatus: HealthCheckStatusType): boolean {
    if (this.mailSendInfo.isScheduledSend && this.mailSendInfo.lastCheckStatus !== healthStatus) {
      return true;
    } else if (!this.mailSendInfo.isScheduledSend && this.mailSendInfo.lastCheckStatus !== healthStatus) {
      return true;
    }
    return false;
  }

  private getSendMailInfoData(healthResult: HealthCheckMailFormat): SendMailData {
    const { mail } = this.configService.get('health') as HealthMailEnvironmentVariables;
    return {
      to: mail.mailListNotifyer,
      from: mail.from,
      subject: HealthCheckStatusType[healthResult.status],
      context: { service: healthResult.service },
      template: TemplateTypes.heathService,
    };
  }
}
