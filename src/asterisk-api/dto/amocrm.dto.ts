import { IsNotEmpty, IsString } from 'class-validator';
import { AmocrmActionStatus } from '../interfaces/asterisk-api.enum';

export class AmocrmDto {
  @IsString()
  @IsNotEmpty({ message: 'Поле sip_id не может быть пустым. ' })
  _login: string;

  @IsString()
  @IsNotEmpty({ message: 'Поле sip_id не может быть пустым. ' })
  _secret: string;

  @IsString()
  _action: AmocrmActionStatus;

  @IsString()
  rand?: string;

  @IsString()
  from?: string;

  @IsString()
  to?: string;

  @IsString()
  as?: string;

  @IsString()
  _?: string;
}
