import { TelegramEnvironmentVariables } from '@app/config/interfaces/config.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramMessage, TelegramService as Tg } from 'nestjs-telegram';

@Injectable()
export class TelegramService {
  private telegramConfig = this.configService.get<TelegramEnvironmentVariables>('telegram');
  constructor(private readonly telegramService: Tg, private readonly configService: ConfigService) {}

  public async tgAlert(message: string, context: string): Promise<TelegramMessage> {
    try {
      return await this.telegramService
        .sendMessage({
          chat_id: this.telegramConfig.chartId,
          text: `[${context}]: ${message}`,
          parse_mode: 'html',
        })
        .toPromise();
    } catch (e) {
      console.log(e);
    }
  }
}
