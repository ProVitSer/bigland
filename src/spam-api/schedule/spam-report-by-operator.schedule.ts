import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { ReportService } from '../../reports/reports.service';
import { MangoSpamReport, MttSpamReport, BeelineSpamReport, OptimaSpamReport, ZadarmaSpamReport } from '../spam-report';
import { EVERY_7_DAY_AT_10PM, EVERY_7_DAY_AT_9PM, EVERY_7_DAY_AT_9_10PM, EVERY_7_DAY_AT_9_40PM } from '../spam-api.constants';

@Injectable()
export class SpamReportByOperatorSchedule {
    constructor(
        private readonly mango: MangoSpamReport,
        private readonly mtt: MttSpamReport,
        private readonly beeline: BeelineSpamReport,
        private readonly optima: OptimaSpamReport,
        private readonly zadarma: ZadarmaSpamReport,
        private readonly reportService: ReportService,
        private readonly log: LogService,
    ) {}

    // @Cron(CronExpression.EVERY_DAY_AT_10PM)
    async mangoReport() {

        if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {

            try {

                this.reportService.generateReport(this.mango);

            } catch (e) {

                this.log.error(e, SpamReportByOperatorSchedule.name);

            }

        }
    }

    // @Cron(EVERY_7_DAY_AT_9PM)
    async optimaReport() {

        if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {

            try {

                this.reportService.generateReport(this.optima);

            } catch (e) {

                this.log.error(e, SpamReportByOperatorSchedule.name);

            }

        }
    }

    // @Cron(EVERY_7_DAY_AT_9_10PM)
    async beelineReport() {

        if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {

            try {

                this.reportService.generateReport(this.beeline);

            } catch (e) {

                this.log.error(e, SpamReportByOperatorSchedule.name);

            }

        }
    }

    // @Cron(EVERY_7_DAY_AT_9_40PM)
    async mttReport() {

        if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {

            try {

                this.reportService.generateReport(this.mtt);

            } catch (e) {

                this.log.error(e, SpamReportByOperatorSchedule.name);

            }
        }
    }

    // @Cron(EVERY_7_DAY_AT_10PM)
    async zadarmaReport() {

        if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {

            try {

                this.reportService.generateReport(this.zadarma);

            } catch (e) {

                this.log.error(e, SpamReportByOperatorSchedule.name);
                
            }
        }
    }
}