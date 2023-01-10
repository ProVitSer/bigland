import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  SmsStatusDescription,
  SmsType,
} from '../interfaces/gsm-gateway-api.enum';

@Schema({ collection: 'sms', versionKey: false })
export class Sms {
  @ApiProperty({
    description: 'Уникальный идентификатор смс сообщения',
    nullable: false,
  })
  @Prop()
  unicid: string;

  @ApiProperty({
    description: 'Статус сообщения',
    enum: SmsStatusDescription,
    nullable: false,
  })
  @Prop()
  status: SmsStatusDescription;

  @Prop()
  type: SmsType;

  @ApiProperty({
    description: 'Мобильный номер на который отправлена смс',
    nullable: false,
  })
  @Prop()
  mobileNumber: string;

  @ApiProperty({
    description: 'GSM порт через который смс была отправлена',
    nullable: false,
  })
  @Prop()
  gsmPort: string;

  @ApiProperty({ description: 'Текст смс сообщения', nullable: false })
  @Prop()
  smsText: string;

  @ApiProperty({ description: 'Время добавления', nullable: false })
  @Prop({ type: Date, default: Date.now })
  stamp?: Date;

  @ApiProperty({ description: 'Время обновление', nullable: false })
  @Prop({ type: Date, default: Date.now })
  changed?: Date;
}

export const SmsSchema = SchemaFactory.createForClass(Sms);

export type SmsDocument = Sms & Document;
