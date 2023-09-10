import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { NumbersInfo, Operators } from '@app/operators/operators.schema';
import { CheckSpamStatus, SpamType } from './spam-api.enum';
import { ApplicationApiActionStatus } from '@app/bigland/interfaces/bigland.enum';
import { DefaultApplicationApiStruct } from '@app/bigland/interfaces/bigland.interfaces';
import { SpamCheckNumbersInfo, SpamCheckResult } from '../spam.schema';
import { ApiProperty } from '@nestjs/swagger';

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

export class SpamCheckReportsResult {
  @ApiProperty({
    enum: OperatorsName,
    enumName: 'OperatorsName',
    description: 'Название оператора',
    example: 'mango',
  })
  operator: OperatorsName;

  @ApiProperty({
    enum: CheckSpamStatus,
    enumName: 'CheckSpamStatus',
    description: 'Результат проврки номера',
    example: 'normal',
  })
  status: CheckSpamStatus;

  @ApiProperty({
    type: String,
    description: 'Номер проверки',
    example: '71234567890',
  })
  number: string;
}

export class SpamReportsResponseStruct {
  @ApiProperty({ type: String, description: 'Уникальный идентификатор проверки', example: '90859260-dd5c-4232-bc59-8964963a061c' })
  applicationId: string;

  @ApiProperty({
    enum: ApplicationApiActionStatus,
    enumName: 'ApplicationApiActionStatus',
    description: 'Статус запуска проверки',
    example: 'inProgress',
    default: 'inProgress',
  })
  status: ApplicationApiActionStatus;

  @ApiProperty({
    type: [SpamCheckReportsResult],
    description: 'Результат проверки',
  })
  resultSpamCheck: SpamCheckReportsResult[];

  @ApiProperty({
    type: Date,
    description: 'Дата проверки',
  })
  checkDate: Date;
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

export class StopCheckResult {
  @ApiProperty({
    type: Boolean,
    description: 'Результат остановки проверки на спам',
  })
  result: boolean;
}
