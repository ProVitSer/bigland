import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TransferTestDTO {
    @IsNotEmpty({
        message: 'Поле to_extension не может быть пустым.'
    })
    @IsString({
        message: 'Поле to_extension должно быть строкой'
    })
    @ApiProperty({
        type: String,
        description: 'Внутренний номер менеджера на которого будет произведен трансфер вызова',
        example: '997',
    })
    to_extension: string;

    @IsNotEmpty({
        message: 'Поле from_extension не может быть пустым.'
    })
    @IsString({
        message: 'Поле from_extension должно быть строкой'
    })
    @ApiProperty({
        type: String,
        description: 'Внутренний номер КЦ у которого на hold находиться клиен',
        example: '422',
    })
    from_extension: string;

    channel: string;
}