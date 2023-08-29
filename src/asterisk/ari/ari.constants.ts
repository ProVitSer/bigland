import { PbxGroup } from '@app/pbx-call-routing/interfaces/pbx-call-routing.enum';
import { AsteriskContext } from '../interfaces/asterisk.enum';

export const CONTINUE_DIALPLAN = 'Вызов маршрутизируется по стандартному маршруту для канала';
export const CONTINUE_DIALPLAN_INCOMINGCALL_ERROR = 'Ошибка маршрутизации вызова по стандартному маршруту';
export const CONTINUE_DIALPLAN_BLACKLIST_ERROR = 'Ошибка маршрутизации вызова по стандартному маршруту через BLACKLIST';
export const CONTINUE_DIALPLAN_CHANSPY_ERROR = 'Ошибка маршрутизации вызова по стандартному маршруту через CHANSPY';
export const PLAYBACK_ERROR = 'Ошибка обработки вызова ChanSpy Playback';
export const NUMBER_IN_BLACK_LIST = 'Вызов по входящему вызову попал в black-list';
export const NUMBER_FORMAT = 10;
export const DEFAULT_LOCAL_EXTENSION = '999';
export const AMI_OUTBOUND_CALL = {
  context: AsteriskContext.fromInternal,
  async: 'yes',
  priority: '1',
  timeout: '50000',
};

export const POZVONIM_CALL_CC_PREFIX = '125';
export const POZVONIM_CALL_LOCAL_PREFIX = '124';
export const POZVONIM_LOCAL_EXTENSION_TIMEOUT = 75;
export const POZVONIM_GROUP_TIMEOUT = 60;
export const AMOUNT_NUMBER = 1;

export const INCOMING_CALL_DEFAULT_ROUTING = {
  group: PbxGroup.callCenter,
  localExtension: '900',
};
export const CALL_CENTER_EXTENSIONS: string[] = ['102', '262', '494', '296', '203', '422', '865', '230', '890'];
