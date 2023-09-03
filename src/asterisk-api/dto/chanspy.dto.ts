import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChanspyDto {
  @IsNotEmpty({ message: 'Поле password не может быть пустым.' })
  @IsString({ message: 'Поле password должно быть строкой' })
  @ApiProperty({ type: String, description: 'Пароль', example: '1234' })
  password: string;
}
