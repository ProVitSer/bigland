import { AsteriskBlindTransferEvent, AsteriskDialBeginEvent, AsteriskHungupEvent } from '@app/asterisk/interfaces/asterisk.interfaces';

export type AsteriskUnionEvent = AsteriskHungupEvent | AsteriskBlindTransferEvent | AsteriskDialBeginEvent;

export interface AsteriskAmiEventProviderInterface {
  parseEvent(event: AsteriskUnionEvent): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AsteriskNewExten extends AsteriskHungupEvent {}

export interface AsteriskHangupHandlerProviderInterface {
  handler(event: AsteriskNewExten): Promise<void>;
}
