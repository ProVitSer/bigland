import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService as Tg } from 'nestjs-telegram';

@Injectable()
export class TelegramService {
  private readonly chartId = this.configService.get('telegram.chartId');
  constructor(private readonly telegramService: Tg, private readonly configService: ConfigService) {}

  public async tgAlert(message: string, context: string): Promise<any> {
    try {
      return await this.telegramService
        .sendMessage({
          chat_id: this.chartId,
          text: `[${context}]: ${message}`,
          parse_mode: 'html',
        })
        .toPromise();
    } catch (e) {
      console.log(e);
    }
  }
}
