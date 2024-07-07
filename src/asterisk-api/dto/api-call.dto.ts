import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApiCallDTO {
    @IsString()
    @IsNotEmpty({
        message: 'Поле sip_id не может быть пустым. '
    })
    @ApiProperty({
        type: String,
        description: 'Внутренний номер на который будет производиться изначальный дозвон',
        example: '102'
    })
    sip_id: string;

    @IsString()
    @IsNotEmpty({
        message: 'Поле dst_number не может быть пустым. '
    })
    @ApiProperty({
        type: String,
        description: 'Внешний номер на которы будет производиться вызов после успешного дозвона до внутреннего абонента',
        example: '1117910406122',
    })
    dst_number: string;
}