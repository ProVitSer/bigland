import { DNDApiStatus } from '@app/asterisk/ami/interfaces/ami.enum';
import { CheckNumberSpamData, CheckSpamData } from '@app/spam-api/interfaces/spam-api.interfaces';

export interface IDnd {
  sip_id: string[];
  dnd_status: DNDApiStatus;
}

export interface MonitoringCall {
  numbers: string[];
  description: string;
}

export interface PozvominCall {
  SIP_ID: string;
  DST_NUM: string;
}

export class MonitoringCallResult {
  number: string;
  isCallSuccessful: boolean;
}

export class PozvonimCallResult {
  number: string;
  isCallSuccessful: boolean;
  channelId: string;
}

export class ChanspyPasswordResult {
  password: string;
}

export type AsteriskCallApiUnion = { number: string } | PozvominCall | CheckNumberSpamData | CheckSpamData;
