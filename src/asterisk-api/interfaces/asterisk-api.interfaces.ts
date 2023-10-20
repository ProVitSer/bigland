import { DNDtatus } from '@app/asterisk/ami/interfaces/ami.enum';
import { CheckNumberSpamData, CheckSpamData } from '@app/spam-api/interfaces/spam-api.interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { SipBusynessStateId } from './asterisk-api.enum';

export interface DndData {
  sip_id: string[];
  dnd_status: DNDtatus;
}

export interface MonitoringCall {
  numbers: string[];
  description: string;
}

export interface PozvominCall {
  SIP_ID: string;
  DST_NUM: string;
}

export class MonitoringCallResult {
  @ApiProperty({
    type: String,
    description: 'Номер на который будет производиться дозвон',
    example: '71234567890',
  })
  number: string;

  @ApiProperty({
    type: Boolean,
    description: 'Статус инциализации вызова',
    example: 'true',
  })
  isCallSuccessful: boolean;
}

export class PozvonimCallResult {
  @ApiProperty({ type: String, description: 'Внешний номер', example: '71234567890' })
  number: string;

  @ApiProperty({ type: Boolean, description: 'Статус инциализации вызова', example: 'true' })
  isCallSuccessful: boolean;

  @ApiProperty({ type: String, description: 'Уникальный id канала вызова', example: '4ae75ab3-1bd9-410a-9aa8-027f9535' })
  channelId: string;
}

export class ChanspyPasswordResult {
  @ApiProperty({ type: String, description: 'Пароль', example: '1233' })
  password: string;
}

export class UpdateChanspyPasswordResult {
  @ApiProperty({ type: String, description: 'Обновленный пароль', example: '1233' })
  updatePassword: string;
}

export type AsteriskCallApiUnion = { number: string } | PozvominCall | CheckNumberSpamData | CheckSpamData;

export class ModifyBlackListNumbersResult {
  @ApiProperty({
    type: [String],
    description: 'Массив внешних номеров которые были добавлены в черный список',
    example: '["71234567890","71234567890"]',
  })
  numbers: string[];
}

export class ExtensionState {
  @ApiProperty({ type: String, description: 'Внтуренний номер', example: '102' })
  sip_id: string;

  @ApiProperty({
    enum: SipBusynessStateId,
    enumName: 'SipBusynessStateId',
    description: 'Статус внутреннего номера',
  })
  sip_busyness_state_id: SipBusynessStateId;
}

export class ActualExtensionsState {
  @ApiProperty({ type: [ExtensionState], description: 'Массив данных внутренних номеров и их актуального статуса' })
  items: ExtensionState[];
}
