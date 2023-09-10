import { HealthCheckStatusType } from './interfaces/health.enum';

export const ONAPPLICATION_HEALTH_ERROR = 'Ошибка сервиса проверки работоспособности при старте приложения';
export const HEALTH_ERROR_SCHEDULE = 'Ошибка при проверки работоспособности по времени';
export const HEALTH_MAIL_ERROR = 'Ошибка отправки сообщение на почту при проверки работоспособности';
export const REDIS_PROBLEM = 'Проблемы на сервисе Redis';
export const GSM_PROBLEM = 'Проблемы со взаимодействием с Gsm шлюзом';
export const AMOCRM_PROBLEM = 'Проблемы со взаимодействием с API Amocrm';
export const SERVICE_UP = 'All of Service in UP';
export const SERVICE_DOWN = 'Some of Service is DOWN';

export const HEALTH_CHECK_STATUS_MAP: { [status in HealthCheckStatusType]: string } = {
  [HealthCheckStatusType.ok]: SERVICE_UP,
  [HealthCheckStatusType.error]: SERVICE_DOWN,
};
