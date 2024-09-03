import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class ChannelsStateDTO {
    @IsArray({
        message: 'Поле channelIds должно быть массивом. '
    })
    @ApiProperty({
        type: [String],
        description: 'Массив уникальных id каналов',
        example: '["c217ece6-25cb-4b61-bc4b-c2dd911cda52", "c21333e6-2341-4b61-vc4b-c2dd9ccvfa52"]'
    })
    channelIds: string[];
}