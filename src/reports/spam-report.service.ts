import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { UtilsService } from '@app/utils/utils.service';
import { distinctUntilChanged } from 'rxjs';
import { REPORT_DATE_FORMAT, SPAM_STATUS_DESCRIPTION } from './reports.constants';
import * as moment from 'moment';
import { CheckOperatorNumbersDTO } from '@app/spam-api/dto/check-spam.dto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ReportData } from './interfaces/report.interfaces';
import { AttachmentsData, SendMailData, SpamReportContext, SpamReportLink } from '@app/mail/interfaces/mail.interfaces';
import { FilesCreateService } from '@app/files-api/files-create/files-create.service';
import { ServerStaticService } from '@app/server-static/server-static..service';
import { TemplateTypes } from '@app/mail/interfaces/mail.enum';
import { SpamApiService } from '@app/spam-api/spam-api.service';
import { DefaultApplicationApiStruct } from '@app/bigland/interfaces/bigland.interfaces';
import { Spam, SpamCheckResult } from '@app/spam-api/spam.schema';
import { ApplicationApiActionStatus } from '@app/bigland/interfaces/bigland.enum';

@Injectable()
export class SpamReportService {
  constructor(
    private readonly configService: ConfigService,
    private readonly spamApiService: SpamApiService,
    private readonly filesCreate: FilesCreateService,
    private readonly serverStatic: ServerStaticService,
  ) {}

  public async startSpamCheck(operatorsName: OperatorsName, verificationNumber?: string): Promise<DefaultApplicationApiStruct> {
    const checkCriteria: CheckOperatorNumbersDTO = {
      operator: operatorsName,
      dstNumber: verificationNumber || this.configService.get('reports.spam.verificationNumber'),
    };
    console.log(checkCriteria);
    return await this.spamApiService.checkOperatorNumbers(checkCriteria);
  }

  public async getMailData(operatorsName: OperatorsName, data: ReportData[]): Promise<SendMailData> {
    const attachments = await this.getAttachmentsData(data);
    return {
      to: this.configService.get('reports.spam.to'),
      from: this.configService.get('mail.from'),
      subject: `${this.configService.get('reports.spam.subject')} ${operatorsName} за ${moment().format(REPORT_DATE_FORMAT)}`,
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

  async subscribeReposrtResult(fn: () => Promise<any>, timeout: number): Promise<Spam> {
    return new Promise((resolve, reject) => {
      const subscriber = UtilsService.getObservableFn(fn, timeout)
        .pipe(
          distinctUntilChanged((prev: Spam, current: Spam) => {
            return prev.status === current.status;
          }),
        )
        .subscribe({
          next: async (res: Spam) => {
            switch (res.status) {
              case ApplicationApiActionStatus.completed:
                subscriber.unsubscribe();
                resolve(res);
                break;
              case ApplicationApiActionStatus.inProgress:
                break;
              case ApplicationApiActionStatus.apiFail:
                subscriber.unsubscribe();
                reject(res);
                break;
            }
          },
          error: (e: unknown) => {
            subscriber.unsubscribe();
            reject(e);
          },
        });
    });
  }

  formatReportData(data: Spam, operatorsName: OperatorsName) {
    const numbers = data.spamCheckResult.filter((check: SpamCheckResult) => {
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
}
