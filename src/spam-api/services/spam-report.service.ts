import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { REPORT_DATE_FORMAT } from '../../reports/reports.constants';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ReportData } from '../../reports/interfaces/reports.interfaces';
import { AttachmentsData, SendMailData, SpamReportContext, SpamReportLink } from '@app/mail/interfaces/mail.interfaces';
import { FilesCreateService } from '@app/files-api/files-create/files-create.service';
import { ServerStaticService } from '@app/server-static/server-static..service';
import { TemplateTypes } from '@app/mail/interfaces/mail.enum';
import { Spam, SpamCheckResult } from '@app/spam-api/spam.schema';
import { SPAM_STATUS_DESCRIPTION } from '../spam-api.constants';
import * as json2xls from 'json2xls';
import { FileFormatType } from '@app/files-api/interfaces/files.enum';
import { MailEnvironmentVariables, ReportsEnviromentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class SpamReportService {
  private reportsConfig = this.configService.get<ReportsEnviromentVariables>('reports');
  private mailConfig = this.configService.get<MailEnvironmentVariables>('mail');

  constructor(
    private readonly configService: ConfigService,
    private readonly filesCreate: FilesCreateService,
    private readonly serverStatic: ServerStaticService,
  ) {}

  public async getMailData(operatorsName: OperatorsName, data: ReportData[]): Promise<SendMailData> {
    const attachments = await this.getAttachmentsData(data);
    return {
      to: this.reportsConfig.spam.to,
      from: this.mailConfig.from,
      subject: `${this.reportsConfig.spam.subject} ${operatorsName} за ${moment().format(REPORT_DATE_FORMAT)}`,
      context: this.formatReportsLink(attachments),
      attachments,
      template: TemplateTypes.spamReport,
    };
  }

  public formatReportsLink(data: AttachmentsData[]): SpamReportContext {
    const links: SpamReportLink[] = [];
    data.map((att: AttachmentsData) => {
      links.push({
        link: `${this.serverStatic.getStaticUrl()}/${att.file.generatedFilePath}/${att.file.generatedFileName}`,
      });
    });

    return { reportsLinks: links };
  }

  public async getAttachmentsData(data: ReportData[]): Promise<AttachmentsData[]> {
    const files: AttachmentsData[] = [];
    await Promise.all(
      data.map(async (reportData: ReportData) => {
        files.push({
          file: await this.filesCreate.createFileFromBuffer(reportData.buff, reportData.outputFormat),
          fileFormatType: reportData.outputFormat,
        });
      }),
    );
    return files;
  }

  public formatReportData(data: Spam, operatorsName: OperatorsName) {
    const numbers = data.resultSpamCheck.filter((check: SpamCheckResult) => {
      return check.operator === operatorsName;
    })[0].numbers;
    return numbers.map((item) => {
      return {
        Дата: moment().format(REPORT_DATE_FORMAT),
        Оператор: operatorsName,
        Номер: item.number,
        'Результат проверки': SPAM_STATUS_DESCRIPTION[item.status],
      };
    });
  }

  public async getReportData(result: Spam, operatorsName: OperatorsName): Promise<ReportData[]> {
    return [
      {
        buff: this.getBufferResult(result, operatorsName),
        outputFormat: FileFormatType.xls,
      },
    ];
  }

  private getBufferResult(result: Spam, operatorsName: OperatorsName): Buffer {
    const format = this.formatReportData(result, operatorsName);
    const xls = json2xls(format);
    return Buffer.from(xls, 'binary');
  }
}
