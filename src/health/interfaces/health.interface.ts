import { HealthCheckStatusType } from './health.enum';

export interface MailSendInfo {
  isScheduledSend: boolean;
  lastCheckStatus: HealthCheckStatusType;
}
export interface HealthCheckMailFormat {
  status: HealthCheckStatusType;
  service: ServiceInfo[];
}
export interface ServiceInfo {
  serviceName: string;
  status: string;
  details?: string;
}

export const HealthCheckStatusMap: { [status in HealthCheckStatusType]: string } = {
  [HealthCheckStatusType.ok]: 'All of Service in UP',
  [HealthCheckStatusType.error]: 'Some of Service is DOWN',
};
