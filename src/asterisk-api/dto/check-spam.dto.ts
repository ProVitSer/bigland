import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CheckSpamDTO {
  @IsString()
  @IsNotEmpty({ message: 'Поле localExtension не может быть пустым. ' })
  localExtension: string;

  @IsString()
  @IsNotEmpty({ message: 'Поле dstNumber не может быть пустым. ' })
  dstNumber: string;

  @IsNotEmpty({ message: 'Поле operator не может быть пустым ' })
  @IsEnum(OperatorsName)
  operator: OperatorsName;
}
