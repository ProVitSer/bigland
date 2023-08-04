import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CheckBatchDTO {
  @IsNotEmpty({ message: 'Поле operator не может быть пустым ' })
  @IsEnum(OperatorsName)
  operator: OperatorsName;

  @IsNotEmpty({ message: 'Поле numbers не может быть пустым ' })
  numbers: string[];
}
