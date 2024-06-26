import { HttpStatus } from '@nestjs/common';
import { AmocrmCallStatus, DirectionType, PbxCallStatus } from './interfaces/amocrm.enum';
import { CallType } from '@app/cdr/interfaces/cdr.enum';

export const DEFAULT_NUMBER = '74951234567';
export const CALL_DATE_SUBTRACT = 3;
export const RECORD_PATH_FROMAT = 'YYYY/MM/DD';
export const INIT_AMO_ERROR = 'Ошибка подключения к Amocrm';
export const INIT_AMO_SUCCESS = 'Подключение к Amocrm успешно';
export const INIT_AMO = 'Инициализация взаимодействия с Amocrm';
export const AMOCRM_ERROR_RESPONSE_CODE: number[] = [
    HttpStatus.UNAUTHORIZED,
    HttpStatus.UNPROCESSABLE_ENTITY,
    HttpStatus.METHOD_NOT_ALLOWED,
    HttpStatus.PAYMENT_REQUIRED,
    HttpStatus.FORBIDDEN,
    HttpStatus.TOO_MANY_REQUESTS,
];

export const CALL_STATUS_MAP: { [code in PbxCallStatus]: AmocrmCallStatus } = {
    [PbxCallStatus.ANSWERED]: AmocrmCallStatus.Answer,
    [PbxCallStatus.NOANSWER]: AmocrmCallStatus.NoAnswer,
    [PbxCallStatus.BUSY]: AmocrmCallStatus.Busy,
};

export const DEFAULT_TASKS_TEXT = `
1. Позвонить клиенту в течение 5 минут
2. Продать идею проекта Мой Гектар: беспрецедентное, уникальное предложение - 1 Га за 100 т.р. Это выгодно!  Вилка цен, Участков мало, Акция!
3. Продать Ценности - 9 основных преимуществ проекта. 
4. Пригласить на встречу - назначить время и дату!
5. Уточнить источник лида
6. Записать комментарии, проставить качество и источник лида, цель, бюджет.
`;

export const CALL_DIRECTION_TYPE_MAP: { [key in CallType]: DirectionType } = {
    [CallType.outgoing]: DirectionType.outbound,
    [CallType.incoming]: DirectionType.inbound,
    [CallType.pozvonim]: DirectionType.outbound,
};
