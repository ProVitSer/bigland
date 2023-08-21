import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class Users {
  @IsString()
  @IsNotEmpty({ message: 'Поле firstName не может быть пустым. ' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Поле lastName не может быть пустым. ' })
  lastName: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: 'Поле email не может быть пустым. ' })
  email: string;
}

export class FreePBXCreateUsersDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Users)
  users: Users[];
}
