import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Operators, OperatorsSchema } from './operators.schema';
import { OperatorsService } from './operators.service';
import { OperatorsController } from './operators.controller';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { ConfigModule } from '@nestjs/config';
import { LogModule } from '@app/log/log.module';
import { HttpResponseModule } from '@app/http/http.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramModule } from '@app/telegram/telegram.module';
import { ResetOperatorsNummbersCountSchedule } from './schedule/reset-operators-number-count.schedule';

@Module({
    imports: [
        ConfigModule,
        LogModule,
        HttpResponseModule,
        MongooseModule.forFeature([{
            name: Operators.name,
            schema: OperatorsSchema
        }]),
        ScheduleModule.forRoot(),
        TelegramModule,
    ],
    providers: [OperatorsService, ResetOperatorsNummbersCountSchedule],
    exports: [OperatorsService],
    controllers: [OperatorsController],
})
export class OperatorsModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(LoggerMiddleware, AllowedIpMiddleware).forRoutes(OperatorsController);
    }
}