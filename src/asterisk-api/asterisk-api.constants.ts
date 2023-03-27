import { AsteriskAmdCallStatus, AsteriskApiNumberStatus } from './interfaces/asterisk-api.enum';

export const AMD_STATUS_TO_SPAM_MAP: { [key in AsteriskAmdCallStatus]: AsteriskApiNumberStatus } = {
  [AsteriskAmdCallStatus.MACHINE]: AsteriskApiNumberStatus.spam,
  [AsteriskAmdCallStatus.HUMAN]: AsteriskApiNumberStatus.normal,
  [AsteriskAmdCallStatus.NOTSURE]: AsteriskApiNumberStatus.notSureYet,
  [AsteriskAmdCallStatus.HANGUP]: AsteriskApiNumberStatus.notSureYet,
};
