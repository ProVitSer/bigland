import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { AggregatedSpamService } from '../services/aggregate-spam.service';

@Injectable()
export class AggregatedSpamReportSchedule {
  private applicationId: string;

  constructor(private readonly log: LogService, private readonly aggregatedSpamService: AggregatedSpamService) {}

  //@Cron(CronExpression.EVERY_DAY_AT_8PM)
  async startAggregateReport() {
    try {
      await this.aggregatedSpamService.aggregateScheduleReport();
    } catch (e) {
      this.log.error(e, AggregatedSpamReportSchedule.name);
    }
  }
}
