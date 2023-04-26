import { LogService } from '@app/log/log.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SentMessageInfo } from 'nodemailer';
import { TemplateTypes } from './interfaces/mail.enum';
import { ChanSpyContext, CreatePbxUserContext, SendMail } from './interfaces/mail.interfaces';
import { DEFAULT_SUBJECT } from './mail.constants';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService, private readonly configService: ConfigService, private readonly log: LogService) {}

  public async sendMail({ to, from, subject, context, template }: SendMail): Promise<SentMessageInfo> {
    try {
      const result = await this.mailerService.sendMail({
        from: from || this.configService.get('mail.from'),
        to,
        subject: subject || DEFAULT_SUBJECT,
        context,
        template,
      });
      this.log.info(result, MailService.name);
    } catch (e) {
      this.log.error(e, MailService.name);
      throw e;
    }
  }

  public async sendChanSpyConf(to: string[], context: ChanSpyContext): Promise<SentMessageInfo> {
    const mailOption = {
      to,
      context,
      template: TemplateTypes.password,
    };
    return await this.sendMail(mailOption);
  }

  public async sendCreatePbxUser(to: string, context: CreatePbxUserContext): Promise<SentMessageInfo> {
    const mailOption = {
      to,
      context,
      template: TemplateTypes.userCreate,
    };
    return await this.sendMail(mailOption);
  }
}
