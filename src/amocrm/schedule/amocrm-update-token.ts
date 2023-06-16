import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { AmocrmV4Connector } from '../v4/amocrm-v4.connect';
import { writeFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TelegramService } from '@app/telegram/telegram.service';
import { AmocrmV4Service } from '../v4/amocrm-v4.service';
import { ITokenData } from 'amocrm-js/dist/interfaces/common';

@Injectable()
export class AmocrmUpdateTokenSchedule {
  constructor(
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly amocrmConnect: AmocrmV4Connector,
    private readonly tg: TelegramService,
    private readonly amocrmV4Service: AmocrmV4Service,
  ) {}

  // Обновляем на одном inst после подгружаем на остльные
  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async updateAmocrmToken() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      try {
        this.log.info('Обновление токена Amocrm', AmocrmUpdateTokenSchedule.name);
        const amocrmClient = this.amocrmConnect.getAmocrmClient();
        const token = await amocrmClient.token.refresh();
        return await this.saveToken(token);
      } catch (e) {
        this.log.error(e, AmocrmUpdateTokenSchedule.name);
      }
    }
  }

  private async saveToken(token: ITokenData) {
    this.log.info(`Новый токен: ${JSON.stringify(token)}`, AmocrmUpdateTokenSchedule.name);
    await writeFile(path.join(__dirname, this.configService.get('amocrm.tokenPath')), JSON.stringify(token));
    this.log.info('Новый токен успешно добавлен', AmocrmUpdateTokenSchedule.name);
    this.tg.tgAlert('Новый токен успешно добавлен', AmocrmUpdateTokenSchedule.name);
  }

  @Cron('05 22 * * *')
  async updtaeAmocrmServiceToken() {
    try {
      const token = await this.amocrmConnect.getToken();
      this.amocrmV4Service.updateToken(token);
      this.log.info('Обновление токена в сервисах Amocrm', AmocrmUpdateTokenSchedule.name);
    } catch (e) {
      this.log.error(e, AmocrmUpdateTokenSchedule.name);
    }
  }
}
