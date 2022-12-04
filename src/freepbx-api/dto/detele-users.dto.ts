import { IsArray, IsNotEmpty } from 'class-validator';

export class DeteleUsresDto {
  @IsArray()
  @IsNotEmpty({ message: 'Поле users не может быть пустым. ' })
  users: string[];
}
