import { LogService } from '@app/log/log.service';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_SUBJECT } from './mail.constants';
import { AttachmentsData, SendMailData } from './interfaces/mail.interfaces';
import { Attachment } from 'nodemailer/lib/mailer';
import { FileUtilsService } from '@app/files-api/file-utils/file-utils.service';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService, private readonly configService: ConfigService, private readonly log: LogService) {}

  public async sendMail(data: SendMailData): Promise<void> {
    try {
      const mailData = this.formatMailData(data);
      const result = await this.mailerService.sendMail(mailData);
      this.log.info(result, MailService.name);
    } catch (e) {
      this.log.error(e, MailService.name);
      throw e;
    }
  }

  private formatMailData({ from, to, subject, context, template, attachments }: SendMailData): ISendMailOptions {
    const mailData = {
      from,
      to,
      subject: subject || DEFAULT_SUBJECT,
      context,
      template,
    };
    const att = !!attachments ? { attachments: this.getAttachmentStruct(attachments) } : {};
    Object.assign(mailData, att);

    return mailData;
  }

  private getAttachmentStruct(attachments: AttachmentsData[]): Attachment[] {
    const atts: Attachment[] = [];
    attachments.map((att) => {
      atts.push({
        path: FileUtilsService.getFileFullPath(att.file),
        filename: `${att.file.fileName}.${att.fileFormatType}`,
        contentDisposition: 'attachment',
      });
    });
    return atts;
  }
}
