import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AllOperatorsSpamService } from '../services/all-operators-spam.service';

@Injectable()
export class AllOperatorsSpamReportSchedule {
    constructor(private readonly log: LogService, private readonly allOperatorsSpamService: AllOperatorsSpamService) {}

    // @Cron(CronExpression.EVERY_DAY_AT_9PM)
    async startAllOperatorsReport() {
        try {

            await this.allOperatorsSpamService.checkAllOperators();

        } catch (e) {
            
            this.log.error(e, AllOperatorsSpamReportSchedule.name);
            
        }
    }
}