import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PozvonimCallDTO {
    @IsString()
    @IsNotEmpty({
        message: 'Поле SIP_ID не может быть пустым. '
    })
    @ApiProperty({
        type: String,
        description: 'Внутренний номер на который будет производиться изначальный дозвон',
        example: '102'
    })
    SIP_ID: string;

    @IsString()
    @IsNotEmpty({
        message: 'Поле DST_NUM не может быть пустым. '
    })
    @ApiProperty({
        type: String,
        description: 'Внешний номер на которы будет производиться вызов после успешного дозвона до внутреннего абонента',
        example: '71234567890',
    })
    DST_NUM: string;
}