import { IsNotEmpty, IsString } from 'class-validator';

export class ExtensionRouteDTO {
  @IsNotEmpty({ message: 'Поле extension не может быть пустым' })
  @IsString({ message: 'Поле extension должно быть строкой' })
  extension: string;
}
