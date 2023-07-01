import { CheckSpamStatus } from '@app/spam-api/interfaces/spam-api.enum';

export const SPAM_STATUS_DESCRIPTION: { [key in CheckSpamStatus]: string } = {
  [CheckSpamStatus.failed]: 'Ошибка проверки',
  [CheckSpamStatus.spam]: 'Номер в спаме',
  [CheckSpamStatus.normal]: 'Нормально',
  [CheckSpamStatus.notSureYet]: 'Не удалось определить',
};

export const REPORT_NOT_EXISTS = 'Выбранный отчет отсутствует';
export const REPORT_DATE_FORMAT = 'DD.MM.YYYY';
export const REPORT_RESULT_SUB_TIMER = 10000;
