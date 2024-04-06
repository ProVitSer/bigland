import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { TelegramModule } from '@app/telegram/telegram.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './log.schems';
import { createLogger } from '@app/config/project-configs/log.config';
import { LogLevel } from '@app/config/interfaces/config.enum';

@Module({
    imports: [
        TelegramModule,
        MongooseModule.forFeature([{
            name: Log.name,
            schema: LogSchema
        }]),
        WinstonModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: () => {
                return createLogger([LogLevel.console, LogLevel.info, LogLevel.error]);
            },
            inject: [ConfigService],
        }),
    ],
    providers: [LogService],
    exports: [LogService],
})
export class LogModule {}