import { MiddlewareConsumer, Module } from '@nestjs/common';
import { SpamApiController } from './controllers/spam-api.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LogModule } from '@app/log/log.module';
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
import { AllOperatorsSpamReportSchedule, SpamReportByOperatorSchedule } from './schedule';
import { SpamApiService, SpamModelService, SpamReportService, AllOperatorsSpamService } from './services';
import { AmiModule } from '@app/asterisk/ami/ami.module';
import { AriModule } from '@app/asterisk/ari/ari.module';

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([{
            name: Spam.name,
            schema: SpamSchema
        }]),
        ScheduleModule.forRoot(),
        LogModule,
        AmiModule,
        AriModule,
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
        AllOperatorsSpamService,
        MangoSpamReport,
        MttSpamReport,
        BeelineSpamReport,
        OptimaSpamReport,
        ZadarmaSpamReport,
        SpamReportByOperatorSchedule,
        AllOperatorsSpamReportSchedule,
    ],
    controllers: [SpamApiController, SpamResultController],
    exports: [SpamApiService],
})
export class SpamApiModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(LoggerMiddleware, AllowedIpMiddleware)
            .forRoutes(SpamResultController, SpamApiController);
    }
}