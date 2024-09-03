import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OriginateCallDTO {
    @IsNotEmpty({
        message: 'Поле dst_number не может быть пустым.'
    })
    @IsString({
        message: 'Поле dst_number должно быть строкой'
    })
    @ApiProperty({
        type: String,
        description: 'Внутренний номер менеджера на который будет производиться первичный дозвон',
        example: '997'
    })
    dst_number: string;

    @IsNotEmpty({
        message: 'Поле src_number не может быть пустым.'
    })
    @IsString({
        message: 'Поле src_number должно быть строкой'
    })
    @ApiProperty({
        type: String,
        description: 'Внутренний номер сотрудника КЦ на который будет произведен дозвон в случае успешного ответа внутреннего номера из dst_number',
        example: '992'
    })
    src_number: string;
}