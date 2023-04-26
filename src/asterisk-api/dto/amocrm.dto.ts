import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AmocrmActionStatus } from '../interfaces/asterisk-api.enum';

export class AmocrmDto {
  @IsString()
  @IsNotEmpty()
  _login: string;

  @IsString()
  @IsNotEmpty()
  _secret: string;

  @IsString()
  _action: AmocrmActionStatus;

  @IsOptional()
  @IsString()
  rand?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  as?: string;

  @IsOptional()
  @IsString()
  _?: string;
}
