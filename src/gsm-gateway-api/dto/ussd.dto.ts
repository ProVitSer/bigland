import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class USSDDto {
  @ApiProperty({
    description:
      'Порт GSM шлюза через который должна быть отправлен ussd запрос ',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'gsmPort number не может быть пустым. ' })
  gsmPort: string;

  @ApiProperty({
    description: 'USSD комбинация',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Поле ussdRequest не может быть пустым. ' })
  ussdRequest: string;
}
