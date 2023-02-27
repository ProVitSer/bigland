import { LogService } from '@app/log/log.service';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Cdr, CdrDocument } from '../cdr.schema';
import { CdrService } from '../cdr.service';
import { Disposition } from '../interfaces/cdr.enum';

@Injectable()
export class CdrSchedule {
  constructor(
    @InjectModel(Cdr.name) private cdrModel: Model<CdrDocument>,
    private readonly cdrService: CdrService,
    private readonly log: LogService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateLdsUserStatus() {
    try {
      const noSendCdr = await this.cdrModel.find({ complete: { $ne: true }, disposition: { $ne: Disposition.failed } });
      if (noSendCdr.length == 0) return;
      for (const cdr of noSendCdr) {
        await UtilsService.sleep(2000);
        await this.cdrService.sendCdrInfo(cdr);
      }
    } catch (e) {
      this.log.error(e, CdrSchedule.name);
    }
  }
}
