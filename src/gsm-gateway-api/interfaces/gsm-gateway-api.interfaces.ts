import { ApiProperty } from '@nestjs/swagger';
import { Operators, SmsStatusDescription, SmsType } from './gsm-gateway-api.enum';

export interface GsmGatewayEventProviderInterface {
  parseEvent(event: GsmGatewayUnionEvent): Promise<void>;
}

export interface SendSMSInfo {
  gsmPort?: string;
  mobileNumber: string;
  smsText: string;
  scheduledTime?: Date;
  unicid?: string;
}

export interface SendScheduledSMSInfo {
  smsItems: SendSMSInfo[];
}

export interface UpdateSMSSendEvent {
  EOL: string;
  variables: string;
  event: string;
  privilege: string;
  id: string;
  smsc: string;
  status: SendSMSStatus;
}

export enum SendSMSStatus {
  successful = 1,
  failure = 0,
}

export const SmsSendStatusMap: {
  [code in SendSMSStatus]?: SmsStatusDescription;
} = {
  [SendSMSStatus.successful]: SmsStatusDescription.successful,
  [SendSMSStatus.failure]: SmsStatusDescription.failure,
};

export class SMSData {
  @ApiProperty({
    description: 'Уникальный идентификатор смс сообщения',
    nullable: false,
  })
  unicid: string;

  @ApiProperty({
    description: 'Тип смс сообщения входящие/исходящее',
    enum: SmsType,
    enumName: 'SmsType',
    nullable: false,
  })
  type: SmsType;

  @ApiProperty({
    description: 'Статус сообщения',
    enum: SmsStatusDescription,
    nullable: false,
  })
  status: SmsStatusDescription;

  @ApiProperty({
    description: 'Мобильный номер на который отправлена смс',
    nullable: false,
  })
  mobileNumber: string;

  @ApiProperty({
    description: 'GSM порт через который смс была отправлена',
    nullable: false,
  })
  gsmPort: string;

  @ApiProperty({ description: 'Текст смс сообщения', nullable: false })
  smsText: string;
}

export class ScheduledSMSData extends SMSData {
  @ApiProperty({
    description: 'Время когда требуется отправить смс',
    nullable: false,
  })
  scheduledTime?: Date;
}

export interface ReceivedSMSEvent {
  lines: string[];
  EOL: string;
  event: string;
  privilege: string;
  id: string;
  gsmspan: string;
  sender: string;
  recvtime: string;
  index: string;
  total: string;
  smsc: string;
  content: string;
}

export class GetGsmPortInfoEvent {
  EOL: string;
  variables: Record<string, unknown>;
  response: string;
  privilege: string;
  actionid: string;
  d_channel: string;
  events: string[];
}

export interface GetGsmPortsInfoEvent {
  lines: string[];
  EOL: string;
  variables: Record<string, unknown>;
  response: string;
  privilege: string;
  actionid: string;
  events: string[];
}

export class GsmPortsFormatInfo {
  @ApiProperty({ description: 'Порт', nullable: false })
  port: string;

  @ApiProperty({
    description: 'Есть ли активная симкарта в порту',
    nullable: false,
  })
  isActive: boolean;
}

export class GsmPortFormatInfo extends GsmPortsFormatInfo {
  @ApiProperty({
    description: 'Название оператора чья симкарто стоит на порту',
    nullable: true,
  })
  operator: Operators;
}

export interface GsmUSSDInfo {
  gsmPort: string;
  ussdRequest: string;
}

export const OperatoBalanceCodeMap: { [code in Operators]: string } = {
  [Operators.mts]: '*100#',
};

export const OperatoGetNumberCodeMap: { [code in Operators]: string } = {
  [Operators.mts]: '*111*0887#',
};

export type GsmGatewayUnionEvent = UpdateSMSSendEvent | ReceivedSMSEvent;

export type UpdateSMSData = Partial<SMSData>;
