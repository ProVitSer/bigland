import { FileFormatType } from '@app/files-api/interfaces/files.enum';
import { ReportType } from './report.enum';
import { SendMailData } from '@app/mail/interfaces/mail.interfaces';

export interface ReportData {
  buff: Buffer;
  outputFormat: FileFormatType;
}

export interface Report {
  getReportData(data: GenerateReportData): Promise<ReportData[]>;
}

export type ReportProviders = {
  [key in ReportType]: Report;
};

export interface GenerateReportData extends Omit<SendMailData, 'attachments'> {
  reportType: ReportType;
}
