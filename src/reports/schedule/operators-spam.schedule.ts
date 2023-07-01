import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { ReportService } from '../reports.service';
import { MangoSpamReport, MttSpamReport, BeelineSpamReport, OptimaSpamReport, ZadarmaSpamReport } from '../reports/spam';

@Injectable()
export class OperatorSpamSchedule {
  constructor(
    private readonly mango: MangoSpamReport,
    private readonly mtt: MttSpamReport,
    private readonly beeline: BeelineSpamReport,
    private readonly optima: OptimaSpamReport,
    private readonly zadarma: ZadarmaSpamReport,
    private readonly reportService: ReportService,
    private readonly log: LogService,
  ) {}

  // @Cron('0 22 * * *')
  @Timeout(30000)
  async mangoReport() {
    //if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
    try {
      this.reportService.generateReport(this.mango);
    } catch (e) {
      this.log.error(e, OperatorSpamSchedule.name);
    }
    //}
  }

  @Cron('0 21 * * 0')
  async optimaReport() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      try {
        this.reportService.generateReport(this.optima);
      } catch (e) {
        this.log.error(e, OperatorSpamSchedule.name);
      }
    }
  }

  @Cron('10 21 * * 0')
  async beelineReport() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      try {
        this.reportService.generateReport(this.beeline);
      } catch (e) {
        this.log.error(e, OperatorSpamSchedule.name);
      }
    }
  }

  @Cron('40 21 * * 0')
  async mttReport() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      try {
        this.reportService.generateReport(this.mtt);
      } catch (e) {
        this.log.error(e, OperatorSpamSchedule.name);
      }
    }
  }

  @Cron('0 22 * * 0')
  async zadarmaReport() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      try {
        this.reportService.generateReport(this.zadarma);
      } catch (e) {
        this.log.error(e, OperatorSpamSchedule.name);
      }
    }
  }
}
