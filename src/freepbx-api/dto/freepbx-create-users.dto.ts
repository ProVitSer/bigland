import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class Users {
    @IsString()
    @IsNotEmpty({
        message: 'Поле firstName не может быть пустым. '
    })
    @ApiProperty({
        type: String,
        description: 'Имя',
        example: 'Сергей'
    })
    firstName: string;

    @IsString()
    @IsNotEmpty({
        message: 'Поле lastName не может быть пустым. '
    })
    @ApiProperty({
        type: String,
        description: 'Фамилия',
        example: 'Пупкин'
    })
    lastName: string;

    @IsEmail()
    @IsString()
    @IsNotEmpty({
        message: 'Поле email не может быть пустым. '
    })
    @ApiProperty({
        type: String,
        description: 'email на который будет отправленны авторизационные данные',
        example: 'email@test.ru'
    })
    email: string;
}

export class FreePBXCreateUsersDto {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({
        each: true
    })
    @Type(() => Users)
    @ApiProperty({
        isArray: true,
        type: Users,
    })
    users: Users[];
}