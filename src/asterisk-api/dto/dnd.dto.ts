import { apiStatusDND } from '@app/asterisk/interfaces/asterisk.enum';
import { IsEnum, IsNotEmpty, IsArray } from 'class-validator';

export class DNDDto {
  @IsNotEmpty({ message: 'Поле sip_id не может быть пустым. ' })
  @IsArray({ message: 'Поле sip_id должно быть массивом. ' })
  sip_id: string[];

  @IsNotEmpty({ message: 'Поле dnd_status не может быть пустым, on/off. ' })
  @IsEnum(apiStatusDND, {
    message: 'Поле dnd_status должно быть одним из значений on/off. ',
  })
  dnd_status: apiStatusDND;
}
