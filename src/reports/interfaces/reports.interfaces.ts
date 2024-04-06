import { FileFormatType } from '@app/files-api/interfaces/files.enum';
import { SendMailData } from '@app/mail/interfaces/mail.interfaces';

export interface ReportData {
    buff: Buffer;
    outputFormat: FileFormatType;
}

export abstract class ReportCreator {
    public abstract getReportData(): Promise<ReportData[]>;
    public abstract getMailData(data: ReportData[]): Promise<SendMailData>;

    public async generateReport(): Promise<SendMailData> {
        const reportData = await this.getReportData();
        return await this.getMailData(reportData);
    }
}
