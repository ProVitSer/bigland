import { AsteriskContext } from '../interfaces/asterisk.enum';

export const CONTINUE_DIALPLAN = 'Вызов маршрутизируется по стандартному маршруту для канала';
export const CONTINUE_DIALPLAN_INCOMINGCALL_ERROR = 'Ошибка маршрутизации вызова по стандартному маршруту';
export const CONTINUE_DIALPLAN_BLACKLIST_ERROR = 'Ошибка маршрутизации вызова по стандартному маршруту через BLACKLIST';
export const CONTINUE_DIALPLAN_CHANSPY_ERROR = 'Ошибка маршрутизации вызова по стандартному маршруту через CHANSPY';
export const PLAYBACK_ERROR = 'Ошибка обработки вызова ChanSpy Playback';
export const NUMBER_IN_BLACK_LIST = 'Вызов по входящему вызову попал в black-list';
export const NUMBER_FORMAT = 10;

export const ARI_OUTBOUND_CALL = {
  context: AsteriskContext.monitoring,
  extension: '2222',
  appArgs: 'dialed',
};

export const AMI_OUTBOUND_CALL = {
  context: AsteriskContext.fromInternal,
  async: 'yes',
  priority: '1',
  timeout: '50000',
};
