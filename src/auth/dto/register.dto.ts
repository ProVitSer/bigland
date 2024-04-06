import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
export class RegisterDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(7)
    password: string;
}