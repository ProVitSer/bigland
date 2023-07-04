import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckOperatorNumbersDTO {
  @IsOptional()
  localExtension?: string;

  @IsString()
  @IsNotEmpty({ message: 'Поле dstNumber не может быть пустым. ' })
  dstNumber: string;

  @IsNotEmpty({ message: 'Поле operator не может быть пустым ' })
  @IsEnum(OperatorsName)
  operator: OperatorsName;
}

export class CheckNumberDTO extends CheckOperatorNumbersDTO {
  @IsString()
  @IsNotEmpty({ message: 'Поле callerId не может быть пустым. ' })
  callerId: string;
}
