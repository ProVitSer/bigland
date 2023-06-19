import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LdsService } from './lds.service';
import { HttpModule } from '@nestjs/axios';
import { LogModule } from '@app/log/log.module';
import { LdsSynchUserSchedule } from './schedule/lds-synch-user.schedule';
import { Lds, LdsSchema } from './lds.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { getLdsConfig } from '@app/config/project-configs/lds.config';
import { LdsController } from './lds.controller';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { HttpResponseModule } from '@app/http/http.module';

@Module({
  imports: [
    ConfigModule,
    LogModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: Lds.name, schema: LdsSchema }]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getLdsConfig,
      inject: [ConfigService],
    }),
    HttpResponseModule,
  ],
  providers: [Lds, LdsService, LdsSynchUserSchedule],
  exports: [LdsService],
  controllers: [LdsController],
})
export class LdsModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware, AllowedIpMiddleware).forRoutes(LdsController);
  }
}
