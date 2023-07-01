import { LogService } from '@app/log/log.service';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { Injectable } from '@nestjs/common';
import * as json2xls from 'json2xls';
import { FileFormatType } from '@app/files-api/interfaces/files.enum';
import { SpamReportService } from '../../spam-report.service';
import { ReportData, ReportCreator } from '../../interfaces/report.interfaces';
import { SendMailData } from '@app/mail/interfaces/mail.interfaces';
import { REPORT_RESULT_SUB_TIMER } from '@app/reports/reports.constants';
import { Spam } from '@app/spam-api/spam.schema';
import { SpamApiService } from '@app/spam-api/spam-api.service';

@Injectable()
export class MttSpamReport extends ReportCreator {
  private applicationId: string;
  private readonly operatorsName: OperatorsName = OperatorsName.mtt;

  constructor(
    private readonly log: LogService,
    private readonly spamApiService: SpamApiService,

    private readonly spamReportService: SpamReportService,
  ) {
    super();
  }

  public async getMailData(data: ReportData[]): Promise<SendMailData> {
    try {
      return await this.spamReportService.getMailData(this.operatorsName, data);
    } catch (e) {
      this.log.error(e, MttSpamReport.name);
    }
  }

  public async getReportData(): Promise<ReportData[]> {
    try {
      return await this.getMangoSpamReport();
    } catch (e) {
      this.log.error(e, MttSpamReport.name);
    }
  }

  private async getMangoSpamReport(): Promise<ReportData[]> {
    try {
      const { applicationId } = await this.spamReportService.startSpamCheck(this.operatorsName);
      this.applicationId = applicationId;
      const result = await this.spamReportService.subscribeReposrtResult(this.getReportResult.bind(this), REPORT_RESULT_SUB_TIMER);
      return [
        {
          buff: this.getBufferResult(result),
          outputFormat: FileFormatType.xls,
        },
      ];
    } catch (e) {
      this.log.error(e, MttSpamReport.name);
    }
  }

  private getBufferResult(result: Spam) {
    const format = this.spamReportService.formatReportData(result, this.operatorsName);
    const xls = json2xls(format);
    return Buffer.from(xls, 'binary');
  }

  private async getReportResult(): Promise<Spam> {
    return await this.spamApiService.getSpamApplicationStatus(this.applicationId);
  }
}
