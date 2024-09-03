import { AriCallType, AsteriskContext } from './ari.enum';
import { Containers } from 'ari-client';
import { AsteriskCallApiUnion } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import Ari from 'ari-client';
import { NumbersInfo } from '@app/operators/operators.schema';
import { SpamData } from '@app/spam-api/interfaces/spam-api.interfaces';
import { OperatorFormatNumber } from '@app/operators/interfaces/operators.enum';
import { PbxGroup } from '@app/pbx-call-routing/interfaces/pbx-call-routing.enum';

export interface AsteriskARIStasisStartEvent {
    type: string;
    timestamp: string;
    args: string[];
    channel: {
        id: string;
        name: string;
        state: string;
        caller: {
            name: string;
            number: string;
        };
        connected: {
            name: string;
            number: string;
        };
        accountcode: string;
        dialplan: {
            context: string;
            exten: string;
            priority: number;
            app_name: string;
            app_data: string;
        };
        creationtime: string;
        language: string;
    };
    asterisk_id: string;
    application: string;
}

export interface ChannelDTMF {
    [key: string]: {
        dtmf: string[];
    };
}

export interface AsteriskAriOriginate {
    endpoint: string;
    extension?: string | undefined;
    context?: string | undefined;
    priority?: number | undefined;
    label?: string | undefined;
    app?: string | undefined;
    appArgs?: string | undefined;
    callerId?: string | undefined;
    timeout?: number | undefined;
    variables?: Containers | undefined;
    otherChannelId?: string | undefined;
    originator?: string | undefined;
    formats?: string | undefined;
}

export interface AmdCallData {
    amountOfNmber: number;
    asteriskApiId: string;
    localExtension: string;
    dstNumber: string;
    callerId: number;
    outSuffix: string;
}

export interface AsteriskAriCall {
    getOriginateInfo(data: AsteriskCallApiUnion, ariClient?: Ari.Client): Promise < AsteriskAriOriginate > ;
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
    context: AsteriskContext.apiPozvonim | AsteriskContext.pozvonim;
    extension: string;
    timeout: number;
    variables: {
        dstNumber: string;
        accountcode: string;
        localExtension: string;
        outSuffix: string;
        trunkCIDOverride: string;
        pbxTrunkNumber: number;
    };
}

export interface OperatorInfo {
    amountOfNmber: number;
    formatNumber: OperatorFormatNumber;
}

export interface CallData {
    incomingNumber: string;
    exten: string;
}

export interface IncomingCallRoutingInfo {
    group: PbxGroup;
    localExtension: string;
}