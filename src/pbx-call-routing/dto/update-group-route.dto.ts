import { IsEnum, IsNotEmpty } from 'class-validator';
import { PbxGroup } from '../interfaces/pbx-call-routing.enum';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';

export class UpdateGroupRouteDTO {
  @IsNotEmpty({ message: 'Поле groupName не может быть пустым' })
  @IsEnum(PbxGroup)
  groupName: PbxGroup;

  @IsNotEmpty({ message: 'Поле operator не может быть пустым ' })
  @IsEnum(OperatorsName)
  operatorName: OperatorsName;
}
