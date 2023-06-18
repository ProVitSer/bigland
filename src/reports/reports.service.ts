import { Injectable } from '@nestjs/common';
import { GenerateReportData, Report, ReportData, ReportProviders } from './interfaces/report.interfaces';
import { ReportType } from './interfaces/report.enum';
import { MangoSpamReport } from './reports/mango-spam-report';
import { REPORT_NOT_EXISTS } from './reports.constants';
import { FilesCreateService } from '@app/files-api/files-create/files-create.service';
import { MailService } from '@app/mail/mail.service';
import { AttachmentsData } from '@app/mail/interfaces/mail.interfaces';

@Injectable()
export class ReportService {
  constructor(
    private readonly filesCreate: FilesCreateService,
    private readonly mail: MailService,
    private readonly mango: MangoSpamReport,
  ) {}
  private get providers(): ReportProviders {
    return {
      [ReportType.mango]: this.mango,
    };
  }

  public async generateReport(data: GenerateReportData): Promise<void> {
    const report = this.getProvider(data.reportType);
    const reportData = await report.getReportData(data);
    const files = await this.getAttachmentsData(reportData);
    await this.sendReport(files, data);
  }

  private getProvider(reportType: ReportType): Report {
    if (!this.providerExists(reportType)) {
      throw REPORT_NOT_EXISTS;
    }
    return this.providers[reportType];
  }

  private providerExists(reportType: ReportType): boolean {
    return reportType in this.providers;
  }

  private async getAttachmentsData(data: ReportData[]): Promise<AttachmentsData[]> {
    const files: AttachmentsData[] = [];
    await Promise.all(
      data.map(async (reportData: ReportData) => {
        files.push({
          file: await this.filesCreate.createFileFromBuffer(reportData.buff, reportData.outputFormat),
          fileFormatType: reportData.outputFormat,
        });
      }),
    );
    return files;
  }

  private async sendReport(attachments: AttachmentsData[], data: GenerateReportData) {
    await this.mail.sendMail({
      ...data,
      attachments,
    });
  }
}
