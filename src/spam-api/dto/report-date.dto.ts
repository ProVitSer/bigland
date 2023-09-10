import { IsOptional } from 'class-validator';
import { IsDateFormat } from '../validator/is-date-format.validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportDateDto {
  @IsOptional()
  @IsDateFormat({ message: 'Некорректный формат даты' })
  @ApiProperty({ type: String, description: 'Дата отчета', example: '2023-07-03' })
  date?: string;
}
