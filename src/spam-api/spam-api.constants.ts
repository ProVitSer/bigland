import { AsteriskAmdCallStatus } from '@app/asterisk/interfaces/asterisk.enum';
import { CheckSpamStatus } from './interfaces/spam-api.enum';

export const AMD_STATUS_TO_SPAM_MAP: { [key in AsteriskAmdCallStatus]: CheckSpamStatus } = {
  [AsteriskAmdCallStatus.MACHINE]: CheckSpamStatus.spam,
  [AsteriskAmdCallStatus.HUMAN]: CheckSpamStatus.normal,
  [AsteriskAmdCallStatus.NOTSURE]: CheckSpamStatus.notSureYet,
  [AsteriskAmdCallStatus.HANGUP]: CheckSpamStatus.notSureYet,
};
