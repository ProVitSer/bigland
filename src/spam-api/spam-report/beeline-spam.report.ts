import { LogService } from '@app/log/log.service';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { Injectable } from '@nestjs/common';
import { ReportData, ReportCreator } from '../../reports/interfaces/reports.interfaces';
import { SendMailData } from '@app/mail/interfaces/mail.interfaces';
import { REPORT_RESULT_SUB_TIMER } from '@app/reports/reports.constants';
import { SpamApiService } from '@app/spam-api/services/spam-api.service';
import { Spam } from '@app/spam-api/spam.schema';
import { BiglandService } from '@app/bigland/bigland.service';
import { SpamReportService } from '../services/spam-report.service';
import { SpamType } from '../interfaces/spam-api.enum';

@Injectable()
export class BeelineSpamReport extends ReportCreator {
  private applicationId: string;
  private readonly operatorsName: OperatorsName = OperatorsName.beeline;

  constructor(
    private readonly log: LogService,
    private readonly spamApiService: SpamApiService,
    private readonly spamReportService: SpamReportService,
    private readonly biglandService: BiglandService,
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
      const { applicationId } = await this.spamApiService.startCheckOperatorNumbers(this.operatorsName, SpamType.report);
      this.applicationId = applicationId;
      const result = await this.biglandService.subscribeApiResult<Spam>(this.getReportResult.bind(this), REPORT_RESULT_SUB_TIMER);
      return await this.spamReportService.getReportData(result, this.operatorsName);
    } catch (e) {
      this.log.error(e, BeelineSpamReport.name);
    }
  }

  private async getReportResult(): Promise<Spam> {
    return await this.spamApiService.getSpamApplicationStatus(this.applicationId);
  }
}
