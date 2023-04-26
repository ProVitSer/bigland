import { TemplateTypes } from './mail.enum';

interface TemplateVariables {
  [key: string]: string | number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MailContact {
  name: string;
  email: string;
}

export interface SendMail {
  to: string | string[];
  from?: string;
  subject?: string;
  context: TemplateVariables | ChanSpyContext | CreatePbxUserContext | HealthCheckServiceInfo;
  template: TemplateTypes;
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
