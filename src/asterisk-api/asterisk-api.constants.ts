import { DNDStatus, DNDtatus, StatusTextExtensionStatus } from '@app/asterisk/ami/interfaces/ami.enum';
import { SipBusynessStateId } from './interfaces/asterisk-api.enum';
import { AriCallType } from '@app/asterisk/ari/interfaces/ari.enum';

export const SEND_CALL_CHECK_SPAM = 30000;
export const NUMBER_NOT_FOUND = 'Переданный номер не найден';
export const NUMBER_IS_NOT_ACTIVE = 'Номер больше не используется';
export const AUTH_AMOCRM_ERROR = 'Ошибка авторизации';
export const ORIGINATE_ERROR = 'Ошибка оригинации вызова';
export const SEARCH_CHANNEL_ERROR = 'Запрашиваемый канал не найден';
export const EXTENSION_CALL_NOT_FOUND = 'Не найден внешний вызов с внутренним номером';
export const INCORRECT_DST_NUMBER = 'Некорректный номер назначения';
export const E164_NUMBER_LENGTH = 11;

export const HINT_STATE_TO_BUSYNESS_STATE: { [code in StatusTextExtensionStatus]: SipBusynessStateId } = {
  [StatusTextExtensionStatus.InUse]: SipBusynessStateId.busy,
  [StatusTextExtensionStatus.Idle]: SipBusynessStateId.free,
  [StatusTextExtensionStatus.Ringing]: SipBusynessStateId.busy,
  [StatusTextExtensionStatus.Unavailable]: SipBusynessStateId.error,
  [StatusTextExtensionStatus.Busy]: SipBusynessStateId.busy,
};

export const DND_STATUS_MAP : { [code in DNDStatus]: DNDtatus } = {
    [DNDStatus.on]: DNDtatus.on,
    [DNDStatus.off]: DNDtatus.off,
};

export const PREFIX_TO_ARI_CALL_TYPE: { [prefix: string]: AriCallType } = {
    "800": AriCallType.apiTollFree,
    "111": AriCallType.apiGorod,
}
