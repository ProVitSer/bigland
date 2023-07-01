import { Module } from '@nestjs/common';
import { ReportService } from './reports.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LogModule } from '@app/log/log.module';
import { AsteriskModule } from '@app/asterisk/asterisk.module';
import { AsteriskApiModule } from '@app/asterisk-api/asterisk-api.module';
import { FilesApiModule } from '@app/files-api/files-api.module';
import { MailModule } from '@app/mail/mail.module';
import { OperatorSpamSchedule } from './schedule/operators-spam.schedule';
import { ServerStaticModule } from '@app/server-static/server-static.module';
import { MangoSpamReport, MttSpamReport, BeelineSpamReport, OptimaSpamReport, ZadarmaSpamReport } from './reports/spam';
import { SpamReportService } from './spam-report.service';
import { SpamApiModule } from '@app/spam-api/spam-api.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    MailModule,
    LogModule,
    AsteriskModule,
    AsteriskApiModule,
    FilesApiModule,
    ServerStaticModule,
    SpamApiModule,
  ],
  providers: [
    ReportService,
    SpamReportService,
    OperatorSpamSchedule,
    MangoSpamReport,
    MttSpamReport,
    BeelineSpamReport,
    OptimaSpamReport,
    ZadarmaSpamReport,
  ],
})
export class ReportsModule {}
