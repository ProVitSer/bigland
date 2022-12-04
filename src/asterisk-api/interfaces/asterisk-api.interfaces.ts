import { apiStatusDND } from '@app/asterisk/interfaces/asterisk.enum';
import { ApiProperty } from '@nestjs/swagger';

export interface IDnd {
  sip_id: Array<string>;
  dnd_status: apiStatusDND;
}

export interface MonitoringCall {
  numbers: Array<string>;
  description: string;
}

export interface PozvominCall {
  SIP_ID: string;
  DST_NUM: string;
}

export class MonitoringCallResult {
  @ApiProperty({
    description: 'Номер на который был произведен вызов',
    nullable: false,
  })
  number: string;

  @ApiProperty({
    description: 'Произошла инициация вызоваили нет',
    nullable: false,
  })
  isCallSuccessful: boolean;
}

export class PozvonimCallResult {
  @ApiProperty({
    description: 'Вынешний номер на которы был дозвон',
    nullable: false,
  })
  number: string;

  @ApiProperty({
    description: 'Результат инициации вызова',
    nullable: false,
  })
  isCallSuccessful: boolean;

  @ApiProperty({
    description: 'Уникальный ID вызова',
    nullable: false,
  })
  channelId: string;
}

export class ChanspyPasswordResult {
  @ApiProperty({
    description: 'Новый сгенерированный пароль для суфлера',
    nullable: false,
  })
  password: string;
}
