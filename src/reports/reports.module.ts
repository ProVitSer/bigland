import { Module } from '@nestjs/common';
import { ReportService } from './reports.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LogModule } from '@app/log/log.module';
import { MangoSpamReport } from './reports/mango-spam-report';
import { AsteriskModule } from '@app/asterisk/asterisk.module';
import { AsteriskApiModule } from '@app/asterisk-api/asterisk-api.module';
import { FilesApiModule } from '@app/files-api/files-api.module';
import { SpamReportService } from './spam-report.service';
import { MailModule } from '@app/mail/mail.module';
import { OperatorSpamSchedule } from './schedule/operators-spam.schedule';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot(), MailModule, LogModule, AsteriskModule, AsteriskApiModule, FilesApiModule],
  providers: [ReportService, OperatorSpamSchedule, SpamReportService, MangoSpamReport],
})
export class ReportsModule {}
