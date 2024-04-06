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
    details ? : string;
}