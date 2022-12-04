import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email пользователя',
    nullable: false,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Имя пользователя',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Пароль пользователя, минимум 7 символов',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
}
