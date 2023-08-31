import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { NumbersInfo, Operators } from '@app/operators/operators.schema';
import { CheckSpamStatus, SpamType } from './spam-api.enum';
import { ApplicationApiActionStatus } from '@app/bigland/interfaces/bigland.enum';
import { DefaultApplicationApiStruct } from '@app/bigland/interfaces/bigland.interfaces';
import { SpamCheckNumbersInfo, SpamCheckResult } from '../spam.schema';

export interface CheckOperatorSpamData {
  applicationId: string;
  localExtension?: string;
  dstNumber: string;
  operator: OperatorsName;
}

export interface CheckNumberSpamData extends CheckOperatorSpamData {
  callerId: string;
}

export interface CheckSpamData {
  data: CheckOperatorSpamData;
  operatorInfo: Operators;
  number: NumbersInfo;
}

export type SpamData = CheckOperatorSpamData | CheckNumberSpamData;

export interface ActualSpamReportInfo {
  applicationId: string;
  status: ApplicationApiActionStatus;
  resultSpamCheck: ResultSpamCheck[];
  checkDate: Date;
}

export interface ResultSpamCheck {
  operator: OperatorsName;
  numbers: SpamCheckInfo[];
}

export interface SpamCheckInfo {
  number: string;
  status: CheckSpamStatus;
}

export interface SpamReportsResponseStruct {
  applicationId: string;
  status: ApplicationApiActionStatus;
  resultSpamCheck: SpamCheckReportsResult[];
  checkDate: Date;
}

export interface SpamCheckReportsResult {
  operator: OperatorsName;
  status: CheckSpamStatus;
  number: string;
}

export interface SaveCheckNumberData {
  defaultApiStruct: DefaultApplicationApiStruct;
  operator: OperatorsName;
  numbers: SpamCheckNumbersInfo[];
  spamType: SpamType;
}

export interface FormatSpamUpdateData {
  resultSpamCheck: SpamCheckResult[];
  status?: ApplicationApiActionStatus;
}
