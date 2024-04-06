import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';

export class MonitoringCallDTO {
    @IsNotEmpty({
        message: 'Поле numbers не может быть пустым. '
    })
    @IsArray({
        message: 'Поле numbers должно быть массивом. '
    })
    @IsString({
        each: true
    })
    @ApiProperty({
        type: [String],
        description: 'Массив внешних номеров на который будет производиться дозвон',
        example: '["71234567890", "71234567899"]',
    })
    numbers: string[];

    @IsOptional()
    @IsString()
    description: string;
}