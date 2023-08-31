import { AsteriskAmdCallStatus, AsteriskDialStatus } from '@app/asterisk/ari/interfaces/ari.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckSpamCallResultDTO {
  @IsString()
  @IsEnum(AsteriskAmdCallStatus)
  amdStatus: AsteriskAmdCallStatus;

  @IsString()
  @IsNotEmpty()
  amountOfNmber: string;

  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @IsString()
  @IsNotEmpty()
  dstNumber: string;

  @IsString()
  @IsNotEmpty()
  callerId: string;

  @IsOptional()
  @IsString()
  dialStatus?: AsteriskDialStatus;
}
