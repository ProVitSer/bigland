import { IsOptional } from 'class-validator';
import { IsDateFormat } from '../validator/is-date-format.validator';

export class ReportDateDto {
  @IsOptional()
  @IsDateFormat({ message: 'Некорректный формат даты' })
  date?: string;
}
