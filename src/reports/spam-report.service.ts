import { AsteriskApiActionStatus } from '@app/asterisk-api/interfaces/asterisk-api.enum';
import { AsteriskApiStatusData, DefaultAsterisApiResponceStruct } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { UtilsService } from '@app/utils/utils.service';
import { distinctUntilChanged } from 'rxjs';
import { REPORT_DATE_FORMAT, SPAM_STATUS_DESCRIPTION } from './reports.constants';
import * as moment from 'moment';
import { CheckOperatorNumbersDTO } from '@app/asterisk-api/dto/check-spam.dto';
import { AsteriskApiService } from '@app/asterisk-api/services';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ReportData } from './interfaces/report.interfaces';
import { AttachmentsData, SendMailData, SpamReportContext, SpamReportLink } from '@app/mail/interfaces/mail.interfaces';
import { FilesCreateService } from '@app/files-api/files-create/files-create.service';
import { ServerStaticService } from '@app/server-static/server-static..service';
import { TemplateTypes } from '@app/mail/interfaces/mail.enum';

@Injectable()
export class SpamReportService {
  constructor(
    private readonly configService: ConfigService,
    private readonly asteriskApiService: AsteriskApiService,
    private readonly filesCreate: FilesCreateService,
    private readonly serverStatic: ServerStaticService,
  ) {}

  public async startSpamCheck(operatorsName: OperatorsName, verificationNumber?: string): Promise<DefaultAsterisApiResponceStruct> {
    const checkCriteria: CheckOperatorNumbersDTO = {
      operator: operatorsName,
      dstNumber: verificationNumber || this.configService.get('reports.spam.verificationNumber'),
    };
    return await this.asteriskApiService.checkOperatorNumbers(checkCriteria);
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

  async subscribeReposrtResult(fn: () => Promise<any>, timeout: number): Promise<AsteriskApiStatusData> {
    return new Promise((resolve, reject) => {
      const subscriber = UtilsService.getObservableFn(fn, timeout)
        .pipe(
          distinctUntilChanged((prev: AsteriskApiStatusData, current: AsteriskApiStatusData) => {
            return prev.status === current.status;
          }),
        )
        .subscribe({
          next: async (res: AsteriskApiStatusData) => {
            switch (res.status) {
              case AsteriskApiActionStatus.completed:
                subscriber.unsubscribe();
                resolve(res);
                break;
              case AsteriskApiActionStatus.inProgress:
                break;
              case AsteriskApiActionStatus.apiFail:
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

  formatReportData(data: AsteriskApiStatusData, operatorsName: OperatorsName) {
    return data.numbersInfo.map((item) => {
      return {
        Дата: moment().format(REPORT_DATE_FORMAT),
        Оператор: operatorsName,
        Номер: item.number,
        'Результат проверки': SPAM_STATUS_DESCRIPTION[item.spamStatus],
      };
    });
  }
}
