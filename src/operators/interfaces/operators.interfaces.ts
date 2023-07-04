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

export interface OperatorsPhones {
  numbers: Phones[];
}

export interface Phones {
  name: OperatorsName;
  phone: string;
}
