import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChanspyDto {
  @ApiProperty({
    description: 'Новый пароль для суфлера',
    nullable: true,
  })
  @IsNotEmpty({ message: 'Поле password не может быть пустым.' })
  @IsString({ message: 'Поле password должно быть строкой' })
  password: string;
}
