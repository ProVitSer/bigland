import { PbxGroup } from '@app/pbx-call-routing/interfaces/pbx-call-routing.enum';

export const AMI_RECONECT = 'Переподключение к AMI ...';
export const AMI_INCORRECT_LOGIN = 'Некорректный логин или пароль от AMI';
export const AMI_CONNECT_SUCCESS = 'Подключение к AMI успешно установлено';
export const ERROR_AMI = 'Проблемы с AMI';
export const INVALIDE_PEER = 'Invalid AMI Salute. Not an AMI?';
export const EVENT_INTERVAL = [300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600];
export const INCOMING_CALL_DEFAULT_ROUTING = {
  group: PbxGroup.callCenter,
  localExtension: '900',
};

export const CALL_CENTER_EXTENSIONS: string[] = ['102', '262', '494', '296', '203', '422', '865', '230', '890'];
