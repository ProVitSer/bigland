import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LdsService } from '../lds.service';

@Injectable()
export class LdsSynchUserSchedule {
  constructor(private readonly ldsService: LdsService, private readonly log: LogService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async updateLdsUserStatus() {
    try {
      const result = await this.ldsService.getLSDUserStatus();
      await this.ldsService.renewLdsUserStatus(result);
    } catch (e) {
      this.log.error(e, LdsSynchUserSchedule.name);
    }
  }
}
