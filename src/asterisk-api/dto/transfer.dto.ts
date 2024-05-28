import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TransferDTO {
    @IsNotEmpty({
        message: 'Поле channelId не может быть пустым.'
    })
    @IsString({
        message: 'Поле channelId должно быть строкой'
    })
    channelId: string;

    @IsNotEmpty({
        message: 'Поле channelId не может быть пустым.'
    })
    @IsString({
        message: 'Поле channelId должно быть строкой'
    })
    from_extension: string;
}