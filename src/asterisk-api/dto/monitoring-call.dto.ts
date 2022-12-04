import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray } from 'class-validator';

export class MonitoringCallDTO {
  @ApiProperty({
    description:
      'Номера на который будет произведен вызов, и при поднятие трубки будет сразу сброшен',
    nullable: false,
    isArray: true,
    type: String,
  })
  @IsNotEmpty({ message: 'Поле numbers не может быть пустым. ' })
  @IsArray({ message: 'Поле numbers должно быть массивом. ' })
  numbers: string[];

  @ApiProperty({
    description: 'Описание к вызову',
    nullable: true,
  })
  description: string;
}
