import { Operators } from '@app/operators/operators.schema';
import { PbxCallRouting } from '../pbx-call-routing.schema';

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
