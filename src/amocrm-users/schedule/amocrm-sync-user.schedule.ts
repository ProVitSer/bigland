import { Lds } from '@app/lds/lds.schema';
import { LdsService } from '@app/lds/lds.service';
import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AmocrmUsers } from '../amocrm-users.schema';
import { AmocrmUsersService } from '../amocrm-users.service';

@Injectable()
export class AmocrmSynchUserSchedule {
  constructor(
    private readonly amocrmUsers: AmocrmUsersService,
    private readonly log: LogService,
    private readonly ldsService: LdsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateLdsUserStatus() {
    try {
      await this.amocrmUsers.clearCollection();
      const formatLds = await this.formatLdsUsers();
      await this.amocrmUsers.addUsers(formatLds);
    } catch (e) {
      this.log.error(e, AmocrmSynchUserSchedule.name);
    }
  }

  private async formatLdsUsers(): Promise<AmocrmUsers[]> {
    const formatLdsUsers: AmocrmUsers[] = [];
    const ldsUsers: Lds[] = await this.ldsService.getLdsUser();
    ldsUsers.map((ldsUser: Lds) => {
      if (ldsUser.sip_id !== null) {
        formatLdsUsers.push({
          localExtension: ldsUser.sip_id,
          amocrmId: ldsUser.amo[0].amo_id,
        });
      }
    });
    return formatLdsUsers;
  }
}
