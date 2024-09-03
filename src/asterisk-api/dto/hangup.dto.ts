import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class HangupCallDTO {
    @IsNotEmpty({
        message: 'Поле channelId не может быть пустым.'
    })
    @IsString({
        message: 'Поле channelId должно быть строкой'
    })
    @ApiProperty({
        type: String,
        description: 'Уникальный id канала вызова',
        example: 'c217ece6-25cb-4b61-bc4b-c2dd911cda52'
    })
    channelId: string;
}