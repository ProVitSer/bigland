import { DNDtatus, DNDStatus, HintStatus } from './interfaces/ami.enum';

export const DEFAULT_REOPEN_AMI_CLIENT = 5000;
export const AMI_RECONECT = 'Переподключение к AMI ...';
export const AMI_INCORRECT_LOGIN = 'Некорректный логин или пароль от AMI';
export const AMI_CONNECT_SUCCESS = 'Подключение к AMI успешно установлено';
export const ERROR_AMI = 'Проблемы с AMI';
export const INVALIDE_PEER = 'Invalid AMI Salute. Not an AMI?';
export const EVENT_INTERVAL = [300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600];
export const NOT_LOCAL_NUMBER = 4;
export const DEFAULT_HANGUP_CDR_TIMEOUT = 1000;
export const MIN_EXTERNAL_NUMBER_LENGTH = 10;
export const DEFAULT_TIMEOUT_HANDLER = 2000;

export const DND_API_TO_DND_STATUS: { [code in DNDtatus]: DNDStatus } = {
  [DNDtatus.on]: DNDStatus.on,
  [DNDtatus.off]: DNDStatus.off,
};

export const DND_API_TO_HINT_STATUS: { [code in DNDtatus]: HintStatus } = {
  [DNDtatus.on]: HintStatus.on,
  [DNDtatus.off]: HintStatus.off,
};
