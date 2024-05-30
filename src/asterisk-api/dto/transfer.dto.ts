import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TransferDTO {
    @IsNotEmpty({
        message: 'Поле channelId не может быть пустым.'
    })
    @IsString({
        message: 'Поле channelId должно быть строкой'
    })
    @ApiProperty({
        type: String,
        description: 'Уникальный id канала вызова который требуется подключить к разговору',
        example: 'c217ece6-25cb-4b61-bc4b-c2dd911cda52',
    })
    channelId: string;

    @IsNotEmpty({
        message: 'Поле channelId не может быть пустым.'
    })
    @IsString({
        message: 'Поле channelId должно быть строкой'
    })
    @ApiProperty({
        type: String,
        description: 'Внутренний номер КЦ у которого на hold находиться клиен',
        example: '422',
    })
    from_extension: string;
}