import { ApiProperty } from '@nestjs/swagger';
import {
  AsteriskCause,
  AsteriskChannelStateDesc,
  AsteriskEvent,
  AsteriskEventType,
  BridgeVideoSourceMode,
  DndStatusType,
  ExtensionCallStatus,
  HangupHandler,
  IsExternal,
  StatusTextExtensionStatus,
} from './ami.enum';

export interface AsteriskHungupEvent {
    lines: [string];
    EOL: string;
    variables: string;
    event: AsteriskEvent;
    privilege: string;
    channel: string;
    channelstate: string;
    channelstatedesc: AsteriskChannelStateDesc;
    calleridnum: string;
    calleridname: string;
    connectedlinenum: string;
    connectedlinename: string;
    language: string;
    accountcode: string;
    context: string;
    exten: string;
    priority: string;
    uniqueid: string;
    linkedid: string;
    extension: string;
    application?: string;
    appdata?: string;
    cause?: AsteriskCause;
}
export interface AsteriskBaseStatusResponse<T> {
  lines: string[];
  EOL: string;
  variables: object;
  response: string;
  actionid: string;
  eventlist: string;
  message: string;
  events: T;
}

export interface AsteriskExtensionStatusEvent {
    lines: [string];
    EOL: string;
    variables: object;
    event: AsteriskEvent;
    privilege: string;
    exten: string;
    context: string;
    hint: string;
    status: ExtensionCallStatus;
    statustext: StatusTextExtensionStatus;
}

export interface AsteriskStatusResponse {
    lines: string[];
    EOL: string;
    variables: object;
    response: string;
    actionid: string;
    eventlist: string;
    message: string;
    events: EventsStatus[];
}

export interface EventsStatus {
    lines: string[];
    EOL: string;
    variables: object;
    event: string;
    privilege?: string;
    channel?: string;
    channelstate?: string;
    channelstatedesc?: string;
    calleridnum?: string;
    calleridname?: string;
    connectedlinenum?: string;
    connectedlinename?: string;
    language?: string;
    accountcode?: string;
    context?: string;
    exten?: string;
    priority?: string;
    uniqueid?: string;
    linkedid?: string;
    type?: string;
    dnid?: string;
    effectiveconnectedlinenum?: string;
    effectiveconnectedlinename?: string;
    timetohangup?: string;
    bridgeid?: string;
    application?: string;
    data?: string;
    nativeformats?: string;
    readformat?: string;
    readtrans?: string;
    writeformat?: string;
    writetrans?: string;
    callgroup?: string;
    pickupgroup?: string;
    seconds?: string;
    actionid?: string;
    eventlist?: string;
    listitems?: string;
    items?: string;
}

export interface AsteriskDNDStatusResponse {
    lines: string[];
    EOL: string;
    variables: object;
    response: string;
    actionid: string;
    eventlist: string;
    message: string;
    events: DNDStatus;
}

export interface DNDStatus {
    lines: string[];
    EOL: string;
    variables: object;
    event: string;
    family: string;
    key: string;
    val: string;
    actionid: string;
}

export interface AsteriskDialBeginEvent {
    lines: [string];
    EOL: string;
    variables: string;
    privilege?: string;
    event: AsteriskEvent;
    channel: string;
    channelstate: string;
    channelstatedesc: AsteriskChannelStateDesc;
    calleridnum: string;
    calleridname: string;
    connectedlinenum: string;
    connectedlinename: string;
    language: string;
    accountcode: string;
    context: string;
    exten: string;
    priority: string;
    uniqueid: string;
    linkedid: string;
    destchannel: string;
    destchannelstate: string;
    destchannelstatedesc: AsteriskChannelStateDesc;
    destcalleridnum: string;
    destcalleridname: string;
    destconnectedlinenum: string;
    destconnectedlinename: string;
    destlanguage: string;
    destaccountcode: string;
    destcontext: string;
    destexten: string;
    destpriority: string;
    destuniqueid: string;
    destlinkedid: string;
    dialstring: string;
}

export interface AsteriskBlindTransferEvent {
    lines: [string];
    EOL: string;
    variables: string;
    privilege?: string;
    event: AsteriskEvent;
    result: string;
    transfererchannel: string;
    transfererchannelstate: string;
    transfererchannelstatedesc: AsteriskChannelStateDesc;
    transferercalleridnum: string;
    transferercalleridname: string;
    transfererconnectedlinenum: string;
    transfererconnectedlinename: string;
    transfererlanguage: string;
    transfereraccountcode: string;
    transferercontext: string;
    transfererexten: string;
    transfererpriority: string;
    transfereruniqueid: string;
    transfererlinkedid: string;
    transfereechannel: string;
    transfereechannelstate: string;
    transfereechannelstatedesc: AsteriskChannelStateDesc;
    transfereecalleridnum: string;
    transfereecalleridname: string;
    transfereeconnectedlinenum: string;
    transfereeconnectedlinename: string;
    transfereelanguage: string;
    transfereeaccountcode: string;
    transfereecontext: string;
    transfereeexten: string;
    transfereepriority: string;
    transfereeuniqueid: string;
    transfereelinkedid: string;
    bridgeuniqueid: string;
    bridgetype: string;
    bridgetechnology: string;
    bridgecreator: string;
    bridgename: string;
    bridgenumchannels: string;
    bridgevideosourcemode: BridgeVideoSourceMode;
    isexternal: IsExternal;
    context: string;
    extension: string;
}

export class DndStatus {
    @ApiProperty({
        enum: DndStatusType,
        description: 'Статус изменения',
        example: 'success'
    })
    status: DndStatusType;
    @ApiProperty({
        type: String,
        description: 'внутренний номер',
        example: '102'
    })
    sip_id: string;
}

export class SetDNDStatusResult {
    @ApiProperty({
        type: [DndStatus],
        description: 'Массив статусов изменения статусаов dnd внутенних номеров'
    })
    sip_ids: DndStatus[];
}

export type AsteriskUnionEvent = AsteriskHungupEvent | AsteriskBlindTransferEvent | AsteriskDialBeginEvent;

export interface AsteriskAmiEventProviderInterface {
    parseEvent(event: AsteriskUnionEvent): Promise < void > ;
}

export type AsteriskAmiEventProviders = {
    [key in AsteriskEventType]: AsteriskAmiEventProviderInterface;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AsteriskNewExten extends AsteriskHungupEvent {}

export interface AsteriskHangupHandlerProviderInterface {
    handler(event: AsteriskNewExten): Promise < void > ;
}

export type AsteriskHangupHandlerProviders = {
    [key in HangupHandler]: AsteriskHangupHandlerProviderInterface;
};

export interface AmiTransferData {
    channelId: string; // Канал который будет трансфериться
    extension: string; // Добавочный на который будет трансфер
    transferContext: string; // Контекст по которому будет производиться трансфер
}