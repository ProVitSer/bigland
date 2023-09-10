import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class FreePBXDeleteUsersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: 'Массив внутренних номеров которые требуется удалить', example: '["102","103"]' })
  extensions: string[];
}
