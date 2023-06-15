import { AsteriskAriOriginate } from '@app/asterisk/interfaces/asterisk.interfaces';
import { AriCallType } from './ari.enum';
import { AsteriskCallApiUnion } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import Ari from 'ari-client';

export interface AsteriskAriCall {
  getOriginateInfo(data: AsteriskCallApiUnion, ariClient?: Ari.Client): Promise<AsteriskAriOriginate>;
}

export type AsteriskAriCallProviders = {
  [key in AriCallType]?: AsteriskAriCall;
};
