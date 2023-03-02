import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { AmocrmV4Connector } from '../v4/amocrm-v4.connect';
import { writeFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Client } from 'amocrm-js';
import { TelegramService } from '@app/telegram/telegram.service';

@Injectable()
export class AmocrmUpdateTokenSchedule {
  constructor(
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly amocrmConnect: AmocrmV4Connector,
    private readonly tg: TelegramService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async updateAmocrmToken() {
    try {
      this.log.info('Обновление токена Amocrm', AmocrmUpdateTokenSchedule.name);
      const amocrmClient = await this.amocrmConnect.getAmocrmClient();
      const token = await amocrmClient.token.refresh();
      return await this.update(amocrmClient, token);
    } catch (e) {
      this.log.error(e, AmocrmUpdateTokenSchedule.name);
    }
  }

  private async update(amocrmClient: Client, token: any) {
    this.log.info('Новый токен: ' + token, AmocrmUpdateTokenSchedule.name);
    await writeFile(path.join(__dirname, this.configService.get('amocrm.tokenPath')), JSON.stringify(token));
    amocrmClient.token.setValue(token);
    this.log.info('Новый токен успешно добавлен', AmocrmUpdateTokenSchedule.name);
    this.tg.tgAlert('Новый токен успешно добавлен', AmocrmUpdateTokenSchedule.name);
  }
}
