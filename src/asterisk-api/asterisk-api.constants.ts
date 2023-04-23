import { AsteriskAmdCallStatus, AsteriskApiNumberStatus, AsteriskDialStatus } from './interfaces/asterisk-api.enum';
export const SEND_CALL_CHECK_SPAM = 30000;
export const NUMBER_NOT_FOUND = 'Переданный номер не найден';
export const NUMBER_IS_NOT_ACTIVE = 'Номер больше не используется';

export const AMD_STATUS_TO_SPAM_MAP: { [key in AsteriskAmdCallStatus]: AsteriskApiNumberStatus } = {
  [AsteriskAmdCallStatus.MACHINE]: AsteriskApiNumberStatus.spam,
  [AsteriskAmdCallStatus.HUMAN]: AsteriskApiNumberStatus.normal,
  [AsteriskAmdCallStatus.NOTSURE]: AsteriskApiNumberStatus.notSureYet,
  [AsteriskAmdCallStatus.HANGUP]: AsteriskApiNumberStatus.notSureYet,
};

export const DIAL_STATUS_TO_SPAM_MAP: { [key in AsteriskDialStatus]: AsteriskApiNumberStatus } = {
  [AsteriskDialStatus.ANSWER]: AsteriskApiNumberStatus.normal,
  [AsteriskDialStatus.BUSY]: AsteriskApiNumberStatus.normal,
  [AsteriskDialStatus.CANCEL]: AsteriskApiNumberStatus.normal,
  [AsteriskDialStatus.CHANUNAVAIL]: AsteriskApiNumberStatus.failed,
  [AsteriskDialStatus.CONGESTION]: AsteriskApiNumberStatus.failed,
  [AsteriskDialStatus.NOANSWER]: AsteriskApiNumberStatus.normal,
};
