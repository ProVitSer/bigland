import { IsNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';

export class MonitoringCallDTO {
  @IsNotEmpty({ message: 'Поле numbers не может быть пустым. ' })
  @IsArray({ message: 'Поле numbers должно быть массивом. ' })
  numbers: string[];

  @IsOptional()
  @IsString()
  description: string;
}
