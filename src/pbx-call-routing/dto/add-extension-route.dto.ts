import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PbxGroup } from '../interfaces/pbx-call-routing.enum';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { Type } from 'class-transformer';

export class ExtensionRouteItem {
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

export class AddExtensionRouteDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtensionRouteItem)
  extensionRoutes: ExtensionRouteItem[];
}
