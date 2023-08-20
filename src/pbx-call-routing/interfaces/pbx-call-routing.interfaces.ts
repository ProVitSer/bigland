import { Operators } from '@app/operators/operators.schema';
import { PbxCallRouting } from '../pbx-call-routing.schema';
import { PbxGroup } from './pbx-call-routing.enum';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';

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

export interface ExtensionRouteInfo {
  localExtension: string;
  operatorsName: OperatorsName;
  extensionGroup: PbxGroup;
  staticCID: string | null;
}
