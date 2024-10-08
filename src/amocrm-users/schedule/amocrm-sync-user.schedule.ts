import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { AmocrmUsersService } from '../amocrm-users.service';

@Injectable()
export class AmocrmSynchUserSchedule {
    constructor(private readonly amocrmUsers: AmocrmUsersService, private readonly log: LogService) {}

    @Cron(CronExpression.EVERY_4_HOURS)
    async updateAmocrmUsers() {

        if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {

            try {

                await this.amocrmUsers.updateAmocrmUsers();

            } catch (e) {

                this.log.error(e, AmocrmSynchUserSchedule.name);
                
            }
        }
    }
}