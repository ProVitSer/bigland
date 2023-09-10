import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckOperatorNumbersDTO {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Внутренний номеров на который будут приходить вызовы для проверки',
    example: '102',
    required: false,
  })
  localExtension?: string;

  @IsString()
  @IsNotEmpty({ message: 'Поле dstNumber не может быть пустым. ' })
  @ApiProperty({ type: String, description: 'Внешний номер', example: '71234567890' })
  dstNumber: string;

  @IsNotEmpty({ message: 'Поле operator не может быть пустым ' })
  @IsEnum(OperatorsName)
  @ApiProperty({
    enum: OperatorsName,
    enumName: 'OperatorsName',
    description: 'Название оператора',
    example: 'mango',
  })
  operator: OperatorsName;
}

export class CheckNumberDTO extends CheckOperatorNumbersDTO {
  @IsString()
  @IsNotEmpty({ message: 'Поле callerId не может быть пустым. ' })
  @ApiProperty({ type: String, description: 'Внешний номер', example: '71234567890' })
  callerId: string;
}
