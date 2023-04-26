import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Users {
  @ApiProperty({
    description: 'Имя пользователя, должно быть уникальным. Желательно Фамилия Имя через пробел',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Поле username не может быть пустым. ' })
  username: string;

  @ApiProperty({
    description: 'Email пользователя куда будет отправлено письмо с данными для подключения к АТС',
    nullable: false,
  })
  @IsDefined()
  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: 'Поле email не может быть пустым. ' })
  email: string;
}

export class CreateUsersDto {
  @ApiProperty({
    description: 'Массив пользователей, для которых требуется создать пару логин/пароль на АТС',
    nullable: false,
    type: Users,
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Users)
  users: Users[];
}
