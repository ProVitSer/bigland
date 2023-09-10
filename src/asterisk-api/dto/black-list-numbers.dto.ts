import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsString, Validate } from 'class-validator';
import { IsE164Constraint } from '../validator/is-e164-phone-number.decorator';

export class BlackListNumbersDTO {
  @IsNotEmpty({ message: 'Поле numbers не может быть пустым. ' })
  @IsArray({ message: 'Поле numbers должно быть массивом. ' })
  @IsString({ each: true })
  @Validate(IsE164Constraint, { each: true })
  @ApiProperty({
    type: [String],
    description: 'Массив внешних номеров которые нужно добавить в черный список',
    example: '["71234567890", "71234567899"]',
  })
  numbers: string[];
}
