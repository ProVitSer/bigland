import { IsNotEmpty, IsString } from 'class-validator';

export class AmocrmDto {
  @IsString()
  @IsNotEmpty({ message: 'Поле sip_id не может быть пустым. ' })
  _login: string;

  @IsString()
  @IsNotEmpty({ message: 'Поле sip_id не может быть пустым. ' })
  _secret: string;

  @IsString()
  _action: AmocrmActionStatus;

  rand?: string;

  from?: string;

  to?: string;

  as?: string;

  _?: string;
}

export enum AmocrmActionStatus {
  status = 'status',
  call = 'call',
  cdr = 'cdr',
}
