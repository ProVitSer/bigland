import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramModule as TgModule } from 'nestjs-telegram';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TgModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          botKey: configService.get('telegram.token'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [TelegramService],
})
export class TelegramModule {}
