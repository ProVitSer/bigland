import { ApiProperty } from '@nestjs/swagger';
import { TTSProviderType } from './proxy-calling-tts.enum';
import { ApplicationApiActionStatus } from '@app/bigland/interfaces/bigland.enum';
import { AsteriskDialStatus } from '@app/asterisk/ari/interfaces/ari.enum';
import { ApplicationId } from '@app/bigland/interfaces/bigland.interfaces';

export class ListVoicesData {
  @ApiProperty({ type: 'string', description: 'Название голоса', example: 'alyona' })
  name: string;

  @ApiProperty({ type: [String], description: 'Задание амплуа', example: '["flirt","funny","sad"]' })
  emotions: string[];
}

export class TTSFile {
  @ApiProperty({ type: 'string', description: 'Уникальный идентификатор голосового файла в системе', example: '64d1338f1364c0f30d949326' })
  fileId: string;
}

export class TTSVoices {
  @ApiProperty({
    enum: TTSProviderType,
    enumName: 'TTSProviderType',
    description: 'Провайдер озвучки',
  })
  ttsType: TTSProviderType;
}

export class TTS {
  @ApiProperty({ type: 'string', description: 'Текст который надо озвучить', example: 'Обзвон для информирования' })
  tts: string;

  @ApiProperty({
    enum: TTSProviderType,
    enumName: 'TTSProviderType',
    description: 'Провайдер озвучки',
  })
  ttsType: TTSProviderType;

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Голос которым будет озвучен текст. Если парамертр не передан, выставляется default голос для данного провайдера озвучки',
    example: 'alena',
  })
  voice?: string;

  @ApiProperty({
    type: 'string',
    required: false,
    description:
      'Эмоция с которой будет озвучен текст. Если парамертр не передан, выставляется default эмоция для данного провайдера озвучки',
    example: 'good',
  })
  emotion?: string;
}

export class CallingTTSTask {
  @ApiProperty({ type: 'string', description: 'Текст который надо озвучить', example: 'Обзвон для информирования' })
  tts: string;

  @ApiProperty({ type: [String], description: 'Номера в формате E164', example: ['74951234567', '79101234567'] })
  phones: string[];

  @ApiProperty({
    enum: TTSProviderType,
    enumName: 'TTSProviderType',
    description: 'Провайдер озвучки, пока реализован только yandex',
  })
  ttsType: TTSProviderType;

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Голос которым будет озвучен текст. Если парамертр не передан, выставляется default голос для данного провайдера озвучки',
    example: 'alena',
  })
  voice?: string;

  @ApiProperty({
    type: 'string',
    required: false,
    description:
      'Эмоция с которой будет озвучен текст. Если парамертр не передан, выставляется default эмоция для данного провайдера озвучки',
    example: 'good',
  })
  emotion?: string;
}

export class CallingNumber {
  @ApiProperty({
    description: 'Номера абонента',
    example: '74951234567',
    required: true,
  })
  dstNumber: string;

  @ApiProperty({
    description: 'Исходящий callerId(номер который отобразиться у абонента)',
    example: '79031234567',
    required: false,
  })
  callerId?: string;

  @ApiProperty({
    description: 'Уникальный идентификатор из Asterisk',
    example: 'a58afc7f-4d7b-4744-9edc-9129e8f74111',
    required: false,
  })
  uniqueid?: string;

  @ApiProperty({
    enum: AsteriskDialStatus,
    enumName: 'AsteriskDialStatus',
    description: 'Результат дозвона до абонента',
    required: false,
  })
  dialStatus?: AsteriskDialStatus;

  @ApiProperty({
    description: 'id голосового файла который проигрался абоненту',
    example: '64d21e2f6837233d77a11641',
    required: false,
  })
  fileId?: string;

  @ApiProperty({
    description: 'Время завершения звонка абоненту',
    example: '2023-08-07T18:10:48.777Z',
    required: false,
  })
  callDate?: string;
}

export class Calling {
  @ApiProperty({
    description: 'Уникальный идентификатор задачи',
    example: '19760f74-a50a-4248-8fc1-44a6aa879b60',
  })
  applicationId: string;

  @ApiProperty({
    description: 'Преобразованный через tts голосовой файл который будет озвучиваться абонентам при обзвоне',
    example: '64d21e2f6837233d77a11641',
  })
  fileId: string;

  @ApiProperty({
    enum: ApplicationApiActionStatus,
    enumName: 'ApplicationApiActionStatus',
    description: 'Актуальный статус выполнения задачи на обзвон',
  })
  status?: ApplicationApiActionStatus;

  @ApiProperty({
    type: [CallingNumber],
    description: 'Результат обзвона по номерам',
  })
  numbers: CallingNumber[];
}

export class CallingTaskModifyResult {
  @ApiProperty({ type: 'boolean', description: 'Резульаь изменения задачи на обзвон', example: 'true' })
  result: boolean;
}

export class CallingTaskUpdateVoiceFile extends ApplicationId {
  @ApiProperty({ type: 'string', description: 'Уникальный идентификатор преобразованного tts файла', example: '64d21e2f6837233d77a11640' })
  fileId: string;
}
