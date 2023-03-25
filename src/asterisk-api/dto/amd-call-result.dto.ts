import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AsteriskAmdCallStatus } from '../interfaces/asterisk-api.enum';

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
}
