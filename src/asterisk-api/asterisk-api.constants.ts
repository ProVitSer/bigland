import { StatusTextExtensionStatus } from '@app/asterisk/ami/interfaces/ami.enum';
import { SipBusynessStateId } from './interfaces/asterisk-api.enum';

export const SEND_CALL_CHECK_SPAM = 30000;
export const NUMBER_NOT_FOUND = 'Переданный номер не найден';
export const NUMBER_IS_NOT_ACTIVE = 'Номер больше не используется';
export const AUTH_AMOCRM_ERROR = 'Ошибка авторизации';

export const HINT_STATE_TO_BUSYNESS_STATE: { [code in StatusTextExtensionStatus]: SipBusynessStateId } = {
  [StatusTextExtensionStatus.InUse]: SipBusynessStateId.busy,
  [StatusTextExtensionStatus.Idle]: SipBusynessStateId.free,
  [StatusTextExtensionStatus.Ringing]: SipBusynessStateId.busy,
  [StatusTextExtensionStatus.Unavailable]: SipBusynessStateId.error,
  [StatusTextExtensionStatus.Busy]: SipBusynessStateId.busy,
};
