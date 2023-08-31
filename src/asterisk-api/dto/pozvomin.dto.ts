import { IsNotEmpty, IsString } from 'class-validator';

export class PozvonimCallDTO {
  @IsString()
  @IsNotEmpty({ message: 'Поле SIP_ID не может быть пустым. ' })
  SIP_ID: string;

  @IsString()
  @IsNotEmpty({ message: 'Поле DST_NUM не может быть пустым. ' })
  DST_NUM: string;
}
