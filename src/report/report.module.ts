import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LogModule } from '@app/log/log.module';
import { MangoSpamReportService } from './reposrts/mango-spam-report';
import { AsteriskModule } from '@app/asterisk/asterisk.module';
import { AsteriskApiModule } from '@app/asterisk-api/asterisk-api.module';
import { FilesApiModule } from '@app/files-api/files-api.module';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot(), LogModule, AsteriskModule, AsteriskApiModule, FilesApiModule],
  providers: [ReportService, MangoSpamReportService],
})
export class ReportModule {}
