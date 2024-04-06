import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramModule as TgModule } from 'nestjs-telegram';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTelegramConfig } from '@app/config/project-configs/telegram.config';

@Module({
    imports: [
        ConfigModule,
        TgModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: getTelegramConfig,
            inject: [ConfigService],
        }),
    ],
    providers: [TelegramService],
    exports: [TelegramService],
})
export class TelegramModule {}