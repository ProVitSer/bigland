import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AsteriskAmdCallStatus, AsteriskDialStatus } from '../interfaces/asterisk-api.enum';

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
