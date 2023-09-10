import { ApiProperty } from '@nestjs/swagger';
import { OperatorsName } from './operators.enum';
import { Operators } from '../operators.schema';

export interface OperatorsInfo {
  name: OperatorsName;
  numbers: string[];
}

export interface FormatOperatorNumber {
  dstNumber: string;
  callerId: string;
}

export class GetOperatorStruct {
  @ApiProperty({
    enum: OperatorsName,
    enumName: 'OperatorsName',
    description: 'Название оператора',
  })
  name: OperatorsName;

  @ApiProperty({ type: [String], description: 'Массив внешних номеров оператора', example: '["71234567890","71234567890"]' })
  numbers: string[];
}

export class Phones {
  @ApiProperty({ enum: OperatorsName, enumName: 'OperatorsName', description: 'Название оператора', example: 'mango' })
  name: OperatorsName;

  @ApiProperty({ type: String, description: 'Номер', example: '71234567890' })
  phone: string;
}

export class OperatorsPhones {
  @ApiProperty({ type: [Phones], description: 'Массив данных об операторах и их номерах' })
  numbers: Phones[];
}

export interface OperatorNumbersInfo {
  operator: Operators | null;
  operatorNumbers: string[];
}

export class UpdateOperatorNumbersResult {
  @ApiProperty({ type: [String], description: 'Массив внешних номеров которые были добавлены', example: '["71234567890","71234567890"]' })
  numbers: string[];
}

export class DeleteeOperatorNumbersResult {
  @ApiProperty({ type: [String], description: 'Массив внешних номеров которые были удалены', example: '["71234567890","71234567890"]' })
  numbers: string[];
}
