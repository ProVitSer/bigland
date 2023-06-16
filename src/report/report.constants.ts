import { AsteriskApiNumberStatus } from '@app/asterisk-api/interfaces/asterisk-api.enum';

export const SPAM_STATUS_DESCRIPTION: { [key in AsteriskApiNumberStatus]: string } = {
  [AsteriskApiNumberStatus.failed]: 'Ошибка проверки',
  [AsteriskApiNumberStatus.spam]: 'Номер в спаме',
  [AsteriskApiNumberStatus.normal]: 'Нормально',
  [AsteriskApiNumberStatus.notSureYet]: 'Не удалось определить',
};
