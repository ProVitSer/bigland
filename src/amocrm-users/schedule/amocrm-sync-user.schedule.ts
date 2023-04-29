import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AmocrmUsersService } from '../amocrm-users.service';

@Injectable()
export class AmocrmSynchUserSchedule {
  constructor(private readonly amocrmUsers: AmocrmUsersService, private readonly log: LogService) {}

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async updateAmocrmUsers() {
    try {
      await this.amocrmUsers.updateAmocrmUsers();
    } catch (e) {
      this.log.error(e, AmocrmSynchUserSchedule.name);
    }
  }
}
