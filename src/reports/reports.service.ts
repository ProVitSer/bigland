import { Injectable } from '@nestjs/common';
import { ReportCreator } from './interfaces/reports.interfaces';
import { MailService } from '@app/mail/mail.service';
import { SendMailData } from '@app/mail/interfaces/mail.interfaces';

@Injectable()
export class ReportService {
    constructor(private readonly mail: MailService) {}

    public async generateReport(report: ReportCreator): Promise<void> {

        const mailData = await report.generateReport();

        await this.sendReport(mailData);

    }

    private async sendReport(data: SendMailData): Promise<void> {

        await this.mail.sendMail({
            ...data,
        });
        
    }
}