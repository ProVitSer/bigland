import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { AmocrmV4AuthService } from '../v4/services/amocrm-v4-auth.service';
import { writeFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TelegramService } from '@app/telegram/telegram.service';
import { ITokenData } from 'amocrm-js/dist/interfaces/common';
import { AmocrmV4RequestService } from '../v4/services/amocrm-v4-request.service';
import { AmocrmEnvironmentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class AmocrmUpdateTokenSchedule {
    private amocrmConfig = this.configService.get<AmocrmEnvironmentVariables>('amocrm');

    constructor(
        private readonly configService: ConfigService,
        private readonly log: LogService,
        private readonly amocrmV4AuthService: AmocrmV4AuthService,
        private readonly tg: TelegramService,
        private readonly amocrmV4RequestService: AmocrmV4RequestService,
    ) {}

    // Обновляем на одном inst после подгружаем на остльные
    @Cron(CronExpression.EVERY_DAY_AT_10PM)
    async updateAmocrmToken(): Promise<void> {

        if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {

            try {

                this.log.info('Обновление токена Amocrm', AmocrmUpdateTokenSchedule.name);

                const amocrmClient = this.amocrmV4AuthService.getAmocrmClient();

                const token = await amocrmClient.token.refresh();

                return await this.saveToken(token);

            } catch (e) {

                this.log.error(e, AmocrmUpdateTokenSchedule.name);

            }
        }
    }

    private async saveToken(token: ITokenData): Promise<void> {

        this.log.info(`Новый токен: ${JSON.stringify(token)}`, AmocrmUpdateTokenSchedule.name);

        await writeFile(path.join(__dirname, this.amocrmConfig.tokenPath), JSON.stringify(token));

        this.log.info('Новый токен успешно добавлен', AmocrmUpdateTokenSchedule.name);

        this.tg.tgAlert('Новый токен успешно добавлен', AmocrmUpdateTokenSchedule.name);

    }

    @Cron('01 22 * * *')
    async updtaeAmocrmServiceToken(): Promise<void> {
        try {

            const token = await this.amocrmV4AuthService.getToken();

            this.amocrmV4RequestService.updateToken(token);

            this.log.info('Обновление токена в сервисах Amocrm', AmocrmUpdateTokenSchedule.name);

        } catch (e) {

            this.log.error(e, AmocrmUpdateTokenSchedule.name);
            
        }
    }
}