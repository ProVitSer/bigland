import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SMSDto {
  @ApiProperty({
    description: 'Порт GSM шлюза через который должна быть отправлена смс. Если не указан, отправляется через рандомный порт',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  gsmPort?: string;

  @ApiProperty({
    description: 'Номер на который требуется отправить смс',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Поле mobileNumber не может быть пустым. ' })
  mobileNumber: string;

  @ApiProperty({
    description: 'Текст смс сообщения',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Поле smsText не может быть пустым. ' })
  smsText: string;
}

export class SendSMSScheduledTime extends SMSDto {
  @ApiProperty({
    description: 'Время когда требуется отправить смс',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Поле scheduledTime не может быть пустым. ' })
  scheduledTime: Date;
}

export class SMSDtoScheduled {
  @ApiProperty({
    description: 'Массив данных отложенных смс',
    nullable: false,
    type: SendSMSScheduledTime,
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SendSMSScheduledTime)
  smsItems: SendSMSScheduledTime[];
}
