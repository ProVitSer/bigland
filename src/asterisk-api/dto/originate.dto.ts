import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OriginateCallDTO {
    @IsNotEmpty({
        message: 'Поле src_number не может быть пустым.'
    })
    @IsString({
        message: 'Поле src_number должно быть строкой'
    })
    @ApiProperty({
        type: String,
        description: 'Внутренний номер на который будет производиться первичный дозвон',
        example: '997'
    })
    src_number: string;

    @IsNotEmpty({
        message: 'Поле dst_number не может быть пустым.'
    })
    @IsString({
        message: 'Поле dst_number должно быть строкой'
    })
    @ApiProperty({
        type: String,
        description: 'Внутренний номер на который будет произведен дозвон в случае успешного ответа внутреннего номера из SRC_NUM',
        example: '992'
    })
    dst_number: string;
}