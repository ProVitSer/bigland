import { DNDtatus } from '@app/asterisk/ami/interfaces/ami.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsArray, IsString } from 'class-validator';

export class DNDDto {
    @IsNotEmpty({
        message: 'Поле sip_id не может быть пустым. '
    })
    @IsArray({
        message: 'Поле sip_id должно быть массивом. '
    })
    @IsString({
        each: true
    })
    @ApiProperty({
        type: [String],
        description: 'Массив внутренних номеров',
        example: '["101", "102"]'
    })
    sip_id: string[];

    @IsNotEmpty({
        message: 'Поле dnd_status не может быть пустым, on/off. '
    })
    @IsEnum(DNDtatus, {
        message: 'Поле dnd_status должно быть одним из значений on/off. ',
    })
    @ApiProperty({
        enum: DNDtatus,
        enumName: 'DNDtatus',
        description: 'DND статус, включить или выключить',
    })
    dnd_status: DNDtatus;
}