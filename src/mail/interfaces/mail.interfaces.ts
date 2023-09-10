import { FileFormatType } from '@app/files-api/interfaces/files.enum';
import { TemplateTypes } from './mail.enum';
import { Files } from '@app/files-api/files.schema';

interface TemplateVariables {
  [key: string]: string | number;
}

export type Contexts = TemplateVariables | ChanSpyContext | CreatePbxUserContext | HealthCheckServiceInfo | SpamReportContext;

export interface SendMailData {
  to: string | string[];
  context: Contexts;
  template: TemplateTypes;
  from: string;
  subject?: string;
  attachments?: AttachmentsData[];
}

export interface AttachmentsData {
  file: Files;
  fileFormatType: FileFormatType;
}

export interface ChanSpyContext {
  context: {
    password: string;
    month: string;
  };
}

export interface CreatePbxUserContext {
  username: string;
  extension: string;
  password: string;
}

export interface HealthCheckServiceInfo {
  service: ServiceInfo[];
}

export interface ServiceInfo {
  serviceName: string;
  status: string;
  details?: string;
}

export interface SpamReportContext {
  reportsLinks: SpamReportLink[];
}

export interface SpamReportLink {
  link: string;
}
