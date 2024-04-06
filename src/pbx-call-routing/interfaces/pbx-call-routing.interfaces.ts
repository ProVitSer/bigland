import { Operators } from '@app/operators/operators.schema';
import { PbxCallRouting } from '../pbx-call-routing.schema';
import { PbxGroup } from './pbx-call-routing.enum';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { ApiProperty } from '@nestjs/swagger';

export interface PbxCallData {
    externalNumber: string;
    localExtension: string;
}

export interface RoutingData {
    callerId: string;
    pbxTrunkNumber: number;
    formatOutboundNumber: string;
}

export interface AggregateCallData {
    pbxCallData: PbxCallData;
    pbxCallRoutingInfo: PbxCallRouting;
    operatorInfo: Operators;
}

export class ExtensionRouteInfo {
    @ApiProperty({
        type: String,
        description: 'Внутренний номер',
        example: '102'
    })
    localExtension: string;

    @ApiProperty({
        enum: OperatorsName,
        enumName: 'OperatorsName',
        description: 'Название оператора связи через которого будут идти исходящие вызовы у данного внутреннего номера',
    })
    operatorsName: OperatorsName;

    @ApiProperty({
        enum: PbxGroup,
        enumName: 'PbxGroup',
        description: 'Абстрактная группа к которой относиться внутренний мноер'
    })
    extensionGroup: PbxGroup;

    @ApiProperty({
        type: String,
        description: 'Статический внешний номер которым должны закрываться исходящие вызовы',
        example: '71234567890',
        required: false,
    })
    staticCID?: string;
}