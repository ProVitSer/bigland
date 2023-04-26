import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PozvonimCallDTO {
  @ApiProperty({
    description: 'Внутренний номер абонента на кого будет переведен вызов',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Поле SIP_ID не может быть пустым. ' })
  SIP_ID: string;

  @ApiProperty({
    description: 'Внешний номер клиента на который требуется произвести дозвон',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Поле DST_NUM не может быть пустым. ' })
  DST_NUM: string;
}
