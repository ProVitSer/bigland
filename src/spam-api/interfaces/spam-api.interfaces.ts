import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { NumbersInfo, Operators } from '@app/operators/operators.schema';

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
