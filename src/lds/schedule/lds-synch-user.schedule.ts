import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LdsService } from '../lds.service';

@Injectable()
export class LdsSynchUserSchedule {
  constructor(private readonly ldsService: LdsService, private readonly log: LogService) {}

  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async updateLdsUserStatus() {
    try {
      const result = await this.ldsService.updateLds();
      this.log.info(`Результат обновдения LDS ${result}`, LdsSynchUserSchedule.name);
    } catch (e) {
      this.log.error(e, LdsSynchUserSchedule.name);
    }
  }
}
