import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class OperatorsNumberDTO {
  @IsNotEmpty({ message: 'Поле numbers не может быть пустым. ' })
  @IsArray({ message: 'Поле numbers должно быть массивом. ' })
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: 'Массив внешних номеров', example: '["71234567890", "71234567899"]' })
  numbers: string[];
}
