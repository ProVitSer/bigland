import { AsteriskAmdCallStatus, AsteriskDialStatus } from '@app/asterisk/interfaces/asterisk.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AmdCallResultDTO {
  @IsString()
  @IsEnum(AsteriskAmdCallStatus)
  amdStatus: AsteriskAmdCallStatus;

  @IsString()
  @IsNotEmpty()
  amountOfNmber: string;

  @IsString()
  @IsNotEmpty()
  asteriskApiId: string;

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
