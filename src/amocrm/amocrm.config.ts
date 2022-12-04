import {
  amocrmCallStatus,
  pbxCallStatus,
} from './interfaces/amocrm.interfaces';

export enum AmoCRMAPIV2 {
  auth = '/private/api/auth.php?type=json',
  account = '/private/api/v2/account',
  events = '/api/v2/events/',
}
export const RecordPathFormat = 'YYYY/MM/DD';

export const callStatuskMap: { [code in pbxCallStatus]?: amocrmCallStatus } = {
  [pbxCallStatus.ANSWERED]: amocrmCallStatus.Answer,
  [pbxCallStatus.NOANSWER]: amocrmCallStatus.NoAnswer,
  [pbxCallStatus.BUSY]: amocrmCallStatus.Busy,
};

export enum ResponsibleUserId {
  AdminCC = 6019824,
  AdminNotWork = 3779682,
}

export enum CreatedById {
  AdminCC = 6990255,
}

export enum CustomFieldsValuesId {
  ContactsPhone = 783578,
  LeadsLgTel = 1288762,
  ContactsLgTel = 1288764,
  Village = 1274981,
}

export enum CustomFieldsValuesEnumId {
  Number = 1760384,
  VillageNumber = 2947510,
  DolinaVauzi = 2957698,
}

export enum ApplicationStage {
  DozvonCC = 14222500,
  OstavilZayavku = 14222500,
}

export enum PipelineId {
  MGSale = 519481,
  Village = 4589241,
}

export enum TaskTypeId {
  NewLead = 343570,
}

export const DefaultTasksText = `
1. Позвонить клиенту в течение 5 минут
2. Продать идею проекта Мой Гектар: беспрецедентное, уникальное предложение - 1 Га за 100 т.р. Это выгодно!  Вилка цен, Участков мало, Акция!
3. Продать Ценности - 9 основных преимуществ проекта. 
4. Пригласить на встречу - назначить время и дату!
5. Уточнить источник лида
6. Записать комментарии, проставить качество и источник лида, цель, бюджет.
`;
