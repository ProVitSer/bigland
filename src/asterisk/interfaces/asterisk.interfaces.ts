import {
  apiStatusDND,
  AsteriskCause,
  AsteriskChannelStateDesc,
  AsteriskEvent,
  Bridgevideosourcemode,
  IsExternal,
  statusDND,
  StatusExtensionStatus,
  statusHint,
  StatustextExtensionStatus,
} from './asterisk.enum';

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

export interface AsteriskExtensionStatusEvent {
  lines: [string];
  EOL: string;
  variables: object;
  event: AsteriskEvent;
  privilege: string;
  exten: string;
  context: string;
  hint: string;
  status: StatusExtensionStatus;
  statustext: StatustextExtensionStatus;
}

export interface AsteriskARIStasisStartEvent {
  type: string;
  timestamp: string;
  args: string[];
  channel: {
    id: string;
    name: string;
    state: string;
    caller: {
      name: string;
      number: string;
    };
    connected: {
      name: string;
      number: string;
    };
    accountcode: string;
    dialplan: {
      context: string;
      exten: string;
      priority: number;
      app_name: string;
      app_data: string;
    };
    creationtime: string;
    language: string;
  };
  asterisk_id: string;
  application: string;
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

export const dndStatusMap: { [code in apiStatusDND]: statusDND } = {
  [apiStatusDND.on]: statusDND.on,
  [apiStatusDND.off]: statusDND.off,
};

export const hintStatusMap: { [code in apiStatusDND]: statusHint } = {
  [apiStatusDND.on]: statusHint.on,
  [apiStatusDND.off]: statusHint.off,
};

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
  bridgevideosourcemode: Bridgevideosourcemode;
  isexternal: IsExternal;
  context: string;
  extension: string;
}

export type AsteriskUnionEvent =
  | AsteriskHungupEvent
  | AsteriskBlindTransferEvent
  | AsteriskDialBeginEvent;

export interface AsteriskAmiEventProviderInterface {
  parseEvent(event: AsteriskUnionEvent): Promise<void>;
}

export interface ChannelDTMF {
  [key: string]: {
    dtmf: string[];
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AsteriskNewExten extends AsteriskHungupEvent {}

export interface AsteriskHangupHandlerProviderInterface {
  handler(event: AsteriskNewExten): Promise<void>;
}

export class SetDNDStatusResult {
  [key: string]: {
    status: string;
  };
}
