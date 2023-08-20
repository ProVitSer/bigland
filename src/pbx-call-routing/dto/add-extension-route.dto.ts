import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PbxGroup } from '../interfaces/pbx-call-routing.enum';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';

export class AddExtensionRouteDTO {
  @IsNotEmpty({ message: 'Поле extension не может быть пустым' })
  @IsString({ message: 'Поле extension должно быть строкой' })
  localExtension: string;

  @IsEnum(PbxGroup)
  @IsOptional()
  groupName?: PbxGroup;

  @IsEnum(OperatorsName)
  @IsOptional()
  operatorName: OperatorsName;

  @IsOptional()
  @IsString({ message: 'Поле extension должно быть строкой' })
  staticCID?: string;
}
