import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OperatorsService } from '../operators.service';
import { TelegramService } from '@app/telegram/telegram.service';

@Injectable()
export class ResetOperatorsNummbersCountSchedule {
  constructor(
    private readonly log: LogService,
    private readonly operatorsService: OperatorsService,
    private readonly tg: TelegramService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateAmocrmUsers() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      try {
        const operators = await this.operatorsService.getOperators();
        for (const operator of operators) {
          await this.operatorsService.resetNumbersCounts(operator.name);
        }
        this.tg.tgAlert('Обнуление счетчиков по операторам связи прошел успешно', ResetOperatorsNummbersCountSchedule.name);
      } catch (e) {
        this.log.error(e, ResetOperatorsNummbersCountSchedule.name);
      }
    }
  }
}
