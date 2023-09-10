import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CheckBatchDTO {
  @IsNotEmpty({ message: 'Поле operator не может быть пустым ' })
  @IsEnum(OperatorsName)
  @ApiProperty({
    enum: OperatorsName,
    enumName: 'OperatorsName',
    description: 'Название оператора',
    example: 'mango',
  })
  operator: OperatorsName;

  @IsNotEmpty({ message: 'Поле numbers не может быть пустым ' })
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: 'Массив номеров которые требуется проверить', example: '["71234567890","71234567890"]' })
  numbers: string[];
}
