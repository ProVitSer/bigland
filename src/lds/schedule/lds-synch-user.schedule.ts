import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LdsService } from '../lds.service';

@Injectable()
export class LdsSynchUserSchedule {
    constructor(private readonly ldsService: LdsService, private readonly log: LogService) {}

    @Cron(CronExpression.EVERY_DAY_AT_10PM)
    async updateLdsUserStatus() {

        if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {

            try {

                await this.ldsService.updateLds();

            } catch (e) {

                this.log.error(e, LdsSynchUserSchedule.name);
                
            }
        }
    }
}