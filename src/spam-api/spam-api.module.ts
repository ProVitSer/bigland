import { MiddlewareConsumer, Module } from '@nestjs/common';
import { SpamApiService, SpamModelService } from './spam-api.service';
import { SpamApiController } from './controllers/spam-api.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LogModule } from '@app/log/log.module';
import { AsteriskModule } from '@app/asterisk/asterisk.module';
import { AuthModule } from '@app/auth/auth.module';
import { HttpResponseModule } from '@app/http/http.module';
import { SystemModule } from '@app/system/system.module';
import { OperatorsModule } from '@app/operators/operators.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { BiglandModule } from '@app/bigland/bigland.module';
import { Spam, SpamSchema } from './spam.schema';
import { SpamResultController } from './controllers/spam-result.controller';
import { MangoSpamReport, MttSpamReport, BeelineSpamReport, OptimaSpamReport, ZadarmaSpamReport } from './spam-report';
import { FilesApiModule } from '@app/files-api/files-api.module';
import { ServerStaticModule } from '@app/server-static/server-static.module';
import { ReportsModule } from '@app/reports/reports.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SpamReportService } from './spam-report.service';
import { OperatorSpamSchedule } from './schedule/operators-spam.schedule';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Spam.name, schema: SpamSchema }]),
    ScheduleModule.forRoot(),
    LogModule,
    AsteriskModule,
    AuthModule,
    HttpResponseModule,
    SystemModule,
    OperatorsModule,
    BiglandModule,
    FilesApiModule,
    ServerStaticModule,
    ReportsModule,
  ],
  providers: [
    SpamApiService,
    SpamModelService,
    SpamReportService,
    MangoSpamReport,
    MttSpamReport,
    BeelineSpamReport,
    OptimaSpamReport,
    ZadarmaSpamReport,
    OperatorSpamSchedule,
  ],
  controllers: [SpamApiController, SpamResultController],
  exports: [SpamApiService],
})
export class SpamApiModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(SpamApiController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(SpamResultController);
  }
}
