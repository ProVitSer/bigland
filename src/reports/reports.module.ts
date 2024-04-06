import { Module } from '@nestjs/common';
import { ReportService } from './reports.service';
import { ConfigModule } from '@nestjs/config';
import { LogModule } from '@app/log/log.module';
import { MailModule } from '@app/mail/mail.module';

@Module({
    imports: [ConfigModule, MailModule, LogModule],
    providers: [ReportService],
    exports: [ReportService],
})
export class ReportsModule {}