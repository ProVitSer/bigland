import { AsteriskEventType, HangupHandler } from '@app/asterisk/interfaces/asterisk.enum';
import { AsteriskBlindTransferEvent, AsteriskDialBeginEvent, AsteriskHungupEvent } from '@app/asterisk/interfaces/asterisk.interfaces';

export type AsteriskUnionEvent = AsteriskHungupEvent | AsteriskBlindTransferEvent | AsteriskDialBeginEvent;

export interface AsteriskAmiEventProviderInterface {
  parseEvent(event: AsteriskUnionEvent): Promise<void>;
}

export type AsteriskAmiEventProviders = {
  [key in AsteriskEventType]: AsteriskAmiEventProviderInterface;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AsteriskNewExten extends AsteriskHungupEvent {}

export interface AsteriskHangupHandlerProviderInterface {
  handler(event: AsteriskNewExten): Promise<void>;
}

export type AsteriskHangupHandlerProviders = {
  [key in HangupHandler]: AsteriskHangupHandlerProviderInterface;
};
