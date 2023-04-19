import { OperatorsName } from './operators.enum';

export interface OperatorsInfo {
  name: OperatorsName;
  numbers: string[];
}

export interface FormatOperatorNumber {
  dstNumber: string;
  callerId: string;
}

export interface GetOperatorStruct {
  name: string;
  numbers: string[];
}
