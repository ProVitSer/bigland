import { IsArray, IsNotEmpty } from 'class-validator';

export class OperatorsNumberDTO {
  @IsNotEmpty({ message: 'Поле numbers не может быть пустым. ' })
  @IsArray({ message: 'Поле numbers должно быть массивом. ' })
  numbers: string[];
}
