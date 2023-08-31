import { DNDApiStatus } from '@app/asterisk/ami/interfaces/ami.enum';
import { IsEnum, IsNotEmpty, IsArray } from 'class-validator';

export class DNDDto {
  @IsNotEmpty({ message: 'Поле sip_id не может быть пустым. ' })
  @IsArray({ message: 'Поле sip_id должно быть массивом. ' })
  sip_id: string[];

  @IsNotEmpty({ message: 'Поле dnd_status не может быть пустым, on/off. ' })
  @IsEnum(DNDApiStatus, {
    message: 'Поле dnd_status должно быть одним из значений on/off. ',
  })
  dnd_status: DNDApiStatus;
}
