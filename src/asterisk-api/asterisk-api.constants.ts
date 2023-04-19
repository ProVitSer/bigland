import { AsteriskAmdCallStatus, AsteriskApiNumberStatus, AsteriskDialStatus } from './interfaces/asterisk-api.enum';

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
