import { LogService } from '@app/log/log.service';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { Injectable } from '@nestjs/common';
import { SpamReportService } from '../spam-report.service';
import { ReportData, ReportCreator } from '../../reports/interfaces/report.interfaces';
import { SendMailData } from '@app/mail/interfaces/mail.interfaces';
import { REPORT_RESULT_SUB_TIMER } from '@app/reports/reports.constants';
import { SpamApiService } from '@app/spam-api/spam-api.service';
import { Spam } from '@app/spam-api/spam.schema';

@Injectable()
export class BeelineSpamReport extends ReportCreator {
  private applicationId: string;
  private readonly operatorsName: OperatorsName = OperatorsName.beeline;

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
      this.log.error(e, BeelineSpamReport.name);
    }
  }

  public async getReportData(): Promise<ReportData[]> {
    try {
      return await this.getBeelineSpamReport();
    } catch (e) {
      this.log.error(e, BeelineSpamReport.name);
    }
  }

  private async getBeelineSpamReport(): Promise<ReportData[]> {
    try {
      const { applicationId } = await this.spamReportService.startSpamCheck(this.operatorsName);
      this.applicationId = applicationId;
      const result = await this.spamReportService.subscribeReposrtResult(this.getReportResult.bind(this), REPORT_RESULT_SUB_TIMER);
      return await this.spamReportService.getReportData(result, this.operatorsName);
    } catch (e) {
      this.log.error(e, BeelineSpamReport.name);
    }
  }

  private async getReportResult(): Promise<Spam> {
    return await this.spamApiService.getSpamApplicationStatus(this.applicationId);
  }
}
