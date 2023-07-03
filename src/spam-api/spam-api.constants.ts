import { AsteriskAmdCallStatus } from '@app/asterisk/interfaces/asterisk.enum';
import { CheckSpamStatus } from './interfaces/spam-api.enum';

export const AMD_STATUS_TO_SPAM_MAP: { [key in AsteriskAmdCallStatus]: CheckSpamStatus } = {
  [AsteriskAmdCallStatus.MACHINE]: CheckSpamStatus.spam,
  [AsteriskAmdCallStatus.HUMAN]: CheckSpamStatus.normal,
  [AsteriskAmdCallStatus.NOTSURE]: CheckSpamStatus.notSureYet,
  [AsteriskAmdCallStatus.HANGUP]: CheckSpamStatus.notSureYet,
};

export const SPAM_STATUS_DESCRIPTION: { [key in CheckSpamStatus]: string } = {
  [CheckSpamStatus.failed]: 'Ошибка проверки',
  [CheckSpamStatus.spam]: 'Номер в спаме',
  [CheckSpamStatus.normal]: 'Нормально',
  [CheckSpamStatus.notSureYet]: 'Не удалось определить',
};

export const EVERY_7_DAY_AT_9PM = '00 21 * * 0';
export const EVERY_7_DAY_AT_9_10PM = '10 21 * * 0';
export const EVERY_7_DAY_AT_9_40PM = '40 21 * * 0';
export const EVERY_7_DAY_AT_10PM = '00 22 * * 0';
export const DATE_FROMAT = 'DD.MM.YYYY';
