import { apiStatusDND } from '@app/asterisk/interfaces/asterisk.enum';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { AsteriskApiActionStatus } from './asterisk-api.enum';
import { NumbersInfo, Operators } from '@app/operators/operators.schema';

export interface IDnd {
  sip_id: string[];
  dnd_status: apiStatusDND;
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

export interface AsteriskApiCheckOperatorSpamData {
  asteriskApiId: string;
  localExtension?: string;
  dstNumber: string;
  operator: OperatorsName;
}

export interface AsteriskApiCheckNumberSpamData extends AsteriskApiCheckOperatorSpamData {
  callerId: string;
}

export type SpamData = AsteriskApiCheckOperatorSpamData | AsteriskApiCheckNumberSpamData;

export interface DefaultAsterisApiResponceStruct {
  asteriskApiId: string;
  status: AsteriskApiActionStatus;
}

export interface CheckOperatorSpamData {
  data: AsteriskApiCheckOperatorSpamData;
  operatorInfo: Operators;
  number: NumbersInfo;
}

export type AsteriskCallApiUnion = { number: string } | PozvominCall | AsteriskApiCheckNumberSpamData | CheckOperatorSpamData;

export interface AsteriskApiStatusData {
  status: AsteriskApiActionStatus;
  [key: string]: any;
}
