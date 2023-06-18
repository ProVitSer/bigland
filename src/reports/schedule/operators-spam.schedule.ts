import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { ReportService } from '../reports.service';
import { GenerateReportData } from '../interfaces/report.interfaces';
import { ReportType } from '../interfaces/report.enum';
import { TemplateTypes } from '@app/mail/interfaces/mail.enum';
import * as moment from 'moment';
import { REPORT_DATE_FORMAT } from '../reports.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OperatorSpamSchedule {
  constructor(
    private readonly configService: ConfigService,
    private readonly reportService: ReportService,
    private readonly log: LogService,
  ) {}

  //   @Cron(CronExpression.EVERY_DAY_AT_10PM)
  //   @Timeout(30000)
  async mangoReport() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      try {
        const reportInfo: GenerateReportData = {
          reportType: ReportType.mango,
          to: this.configService.get('reports.spam.to'),
          from: this.configService.get('reports.spam.from'),
          subject: `${this.configService.get('reports.spam.subject')} Манго за ${moment().format(REPORT_DATE_FORMAT)}`,
          context: {},
          template: TemplateTypes.spamReport,
        };
        this.reportService.generateReport(reportInfo);
      } catch (e) {
        this.log.error(e, OperatorSpamSchedule.name);
      }
    }
  }
}
