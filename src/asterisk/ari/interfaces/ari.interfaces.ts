import { AsteriskAriOriginate, OperatorInfo } from '@app/asterisk/interfaces/asterisk.interfaces';
import { AriCallType } from './ari.enum';
import { AsteriskCallApiUnion } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import Ari from 'ari-client';
import { NumbersInfo } from '@app/operators/operators.schema';
import { SpamData } from '@app/spam-api/interfaces/spam-api.interfaces';
import { AsteriskContext } from '@app/asterisk/interfaces/asterisk.enum';

export interface AsteriskAriCall {
  getOriginateInfo(data: AsteriskCallApiUnion, ariClient?: Ari.Client): Promise<AsteriskAriOriginate>;
}

export type AsteriskAriCallProviders = {
  [key in AriCallType]?: AsteriskAriCall;
};

export interface AmdSpamData {
  spamData: SpamData;
  numberInfo: NumbersInfo;
  operatorInfo: OperatorInfo;
}

export interface PozvonimOperatorInfoData {
  dstNumber: string;
  callerId: string;
  numberInfo: NumbersInfo;
}

export interface PozvonimOriginateInfo {
  endpoint: string;
  callerId: string;
  context: AsteriskContext.pozvonim;
  extension: string;
  timeout;
  variables: {
    dstNumber: string;
    accountcode: string;
    localExtension: string;
    outSuffix: string;
    trunkCIDOverride: string;
    pbxTrunkNumber: number;
  };
}
