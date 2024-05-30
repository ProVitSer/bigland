import { DNDtatus, StatusTextExtensionStatus } from '@app/asterisk/ami/interfaces/ami.enum';
import { CheckNumberSpamData, CheckSpamData } from '@app/spam-api/interfaces/spam-api.interfaces';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { AsteriskChannelState, AsteriskDisposition, DoNotDisturbStatus, SipBusynessStateId } from './asterisk-api.enum';

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
    @ApiProperty({
        type: String,
        description: 'Внешний номер',
        example: '71234567890'
    })
    number: string;

    @ApiProperty({
        type: Boolean,
        description: 'Статус инциализации вызова',
        example: 'true'
    })
    isCallSuccessful: boolean;

    @ApiProperty({
        type: String,
        description: 'Уникальный id канала вызова',
        example: '4ae75ab3-1bd9-410a-9aa8-027f9535'
    })
    channelId: string;
}

export class OriginateCallALeg {
    @ApiProperty({
        type: String,
        description: 'Внутренний номер менеджера',
        example: '997'
    })
    dstNumber?: string;

    @ApiProperty({
        enum: StatusTextExtensionStatus,
        enumName: 'StatusTextExtensionStatus',
        description: 'Статус добавочного',
    })
    extensionStatus: StatusTextExtensionStatus; 

    @ApiProperty({
        type: String,
        description: 'Уникальный id канала вызова',
        example: "bdf8dedf-7fbd-4d65-ad2e-919b9f07c6a0"
    })
    channelId?: string;
}

export class OriginateCallBLeg {
    @ApiProperty({
        type: String,
        description: 'Внутренний номер сотрудника КЦ',
        example: '992'
    })
    srcNumber?: string;

    @ApiProperty({
        enum: StatusTextExtensionStatus,
        enumName: 'StatusTextExtensionStatus',
        description: 'Статус добавочного',
    })
    extensionStatus: StatusTextExtensionStatus; 

    @ApiProperty({
        type: String,
        description: 'Уникальный id канала вызова',
        example:  "68d134d4-dfac-4d0e-b5d1-2b640afe958b"
    })
    channelId?: string;
}

export class OriginateCallInfo {
    @ApiProperty({
        type: OriginateCallALeg,
        description: 'Инфоромация о А плече',
    })
    originateCallALeg: OriginateCallALeg;

    @ApiProperty({
        type: OriginateCallBLeg,
        description: 'Инфоромация о Б плече',
    })
    originateCallBLeg: OriginateCallBLeg
}

export class OriginateCallResult {
    @ApiProperty({
        type: Boolean,
        description: 'Успешность инициализации вызова',
        example: 'true'
    })
    isCallOriginate: boolean;

    @ApiProperty({
        type: OriginateCallInfo,
        description: 'Информация о вызове',
    })
    originateCallInfo: OriginateCallInfo;    
};

export class HangupCallResult {
    @ApiProperty({
        type: Boolean,
        description: 'Результат разрыва связи по каналу',
        example: 'true'
    })
    isCallHangupSuccessful: boolean;
};

export class ChannelStatusResult {
    @ApiProperty({
        enum: AsteriskChannelState,
        description: 'Статус по каналу',
        example: 'UP'
    })
    channelStatus: AsteriskChannelState;

    @ApiProperty({
        enum: AsteriskDisposition,
        description: 'Статус по каналу',
        example: 'ON CALL'
    })
    callDisposition: AsteriskDisposition
};

export class ChanspyPasswordResult {
    @ApiProperty({
        type: String,
        description: 'Пароль',
        example: '1233'
    })
    password: string;
}

export class UpdateChanspyPasswordResult {
    @ApiProperty({
        type: String,
        description: 'Обновленный пароль',
        example: '1233'
    })
    updatePassword: string;
}

export type AsteriskCallApiUnion = {
    number: string
} | PozvominCall | CheckNumberSpamData | CheckSpamData | OriginateCallData;

export class ModifyBlackListNumbersResult {
    @ApiProperty({
        type: [String],
        description: 'Массив внешних номеров которые были добавлены в черный список',
        example: '["71234567890","71234567890"]',
    })
    numbers: string[];
}

export class ExtensionBusynessState {
    @ApiProperty({ type: String, description: 'Внтуренний номер', example: '102' })
    sip_id: string;

    @ApiProperty({
        enum: SipBusynessStateId,
        enumName: 'SipBusynessStateId',
        description: 'Статус внутреннего номера',
    })
    sip_busyness_state_id: SipBusynessStateId;
}

export class ExtensionsItemsDndStatus {
    @ApiProperty({ type: String, description: 'Внтуренний номер', example: '102' })
    sip_id: string;

    @ApiProperty({
        enum: DoNotDisturbStatus,
        enumName: 'DoNotDisturbStatus',
        description: 'Do Not Disturb (DND) статус',
    })
    do_not_disturb_status: DoNotDisturbStatus;
}


export class ActualExtensionBusynessState {
    @ApiProperty({ type: [ExtensionBusynessState], description: 'Массив данных внутренних номеров и их актуального статуса(state)' })
    items: ExtensionBusynessState[];
}

export class ExtensionOriginalState {
    sip_id: string;
    original_extension_state: StatusTextExtensionStatus;
}

export class ActualExtensionOriginalState {
    items: ExtensionOriginalState[];
}

export class DndExtensionsStatus {
    @ApiProperty({ type: [ExtensionsItemsDndStatus], description: 'Массив данных внутренних номеров и их статус Do Not Disturb (DND)' })
    items: ExtensionsItemsDndStatus[];
}


export interface OriginateCallData {
    srcNumber: string;
    dstNumber: string;
    srcChannelId: string;
}


export class TransferResult {
    @ApiProperty({
        type: Boolean,
        description: 'Результат попытки перевод вызова ',
        example: 'true',
    })
    isTransferSuccessful: boolean;
}