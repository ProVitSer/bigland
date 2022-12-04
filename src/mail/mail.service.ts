import { LogService } from '@app/log/log.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChanSpyContext,
  CreatePbxUserContext,
  SendMail,
} from './interfaces/mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly log: LogService,
  ) {}

  public async sendMail({
    to,
    from,
    subject,
    context,
    template,
  }: SendMail): Promise<any> {
    try {
      const result = await this.mailerService.sendMail({
        from: from || this.configService.get('mail.from'),
        to,
        subject: subject || 'Информационное письмо',
        context,
        template,
      });
      this.log.info(result, MailService.name);
    } catch (e) {
      this.log.error(e, MailService.name);
      throw e;
    }
  }

  public async sendChanSpyConf(
    to: string[],
    context: ChanSpyContext,
  ): Promise<any> {
    const mailOption = {
      to,
      context,
      template: 'password-send',
    };
    return await this.sendMail(mailOption);
  }

  public async sendCreatePbxUser(
    to: string,
    context: CreatePbxUserContext,
  ): Promise<any> {
    const mailOption = {
      to,
      context,
      template: 'user-create',
    };
    return await this.sendMail(mailOption);
  }
}
