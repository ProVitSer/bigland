import { CallType } from './cdr.enum';

export interface CdrInfo {
  exten: string;
  unicueid: string;
  extensionNumber: string;
  billsec: string;
  disposition: string;
  startCall: string;
  endCall: string;
}

export interface CdrInfoWithTyp extends CdrInfo {
  callType: CallType;
}
