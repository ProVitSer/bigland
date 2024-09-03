import { ApiCall, PozvominCall } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { OperatorsService } from '@app/operators/operators.service';
import { OperatorsUtils } from '@app/operators/operators.utils';
import { Injectable } from '@nestjs/common';
import {
  POZVONIM_CALL_LOCAL_PREFIX,
  POZVONIM_CALL_CC_PREFIX,
  POZVONIM_LOCAL_EXTENSION_TIMEOUT,
  POZVONIM_GROUP_TIMEOUT,
} from '../ari.constants';
import { AsteriskAriOriginate, PozvonimOperatorInfoData, PozvonimOriginateInfo } from '../interfaces/ari.interfaces';
import { AsteriskContext, ChannelType } from '../interfaces/ari.enum';

@Injectable()
export class ApiPozvonimCallDataAdapter {
    public readonly operator: OperatorsName = OperatorsName.mango;
    public readonly accountcode: string = 'ApiPozvonim';
    constructor(private readonly operatorsService: OperatorsService) {}

    public async getLocalExtensionOriginateInfo(data: ApiCall): Promise<AsteriskAriOriginate> {

        return await this.getOriginateInfo(data, POZVONIM_CALL_LOCAL_PREFIX, POZVONIM_LOCAL_EXTENSION_TIMEOUT);

    }

    public async getCCOriginateInfo(data: ApiCall): Promise<AsteriskAriOriginate> {

        return await this.getOriginateInfo(data, POZVONIM_CALL_CC_PREFIX, POZVONIM_GROUP_TIMEOUT);

    }

    private async getOriginateInfo(data: ApiCall, prefix: string, timeout: number): Promise<PozvonimOriginateInfo> {

        const info = await this.getOperatorInfo(data);

        return {
            endpoint: `${ChannelType.LOCAL}/${prefix}${data.sip_id}@${AsteriskContext.fromInternalAdditional}`,
            callerId: info.dstNumber,
            context: AsteriskContext.apiPozvonim,
            extension: data.sip_id,
            timeout,
            variables: {
                dstNumber: info.dstNumber,
                accountcode: this.accountcode,
                localExtension: data.sip_id,
                outSuffix: info.numberInfo.outSuffix,
                trunkCIDOverride: info.callerId,
                pbxTrunkNumber: info.numberInfo.pbxTrunkNumber,
            },
        };

    }

    private async getOperatorInfo(data: ApiCall): Promise<PozvonimOperatorInfoData> {

        const operatorInfo = await this.operatorsService.getOperator(this.operator);

        const numberInfo = operatorInfo.numbers[Math.floor(Math.random() * operatorInfo.numbers.length)];

        const {
            dstNumber,
            callerId
        } = OperatorsUtils.formatOperatorNumber(
            operatorInfo.formatNumber,
            data.dst_number,
            String(numberInfo.callerId),
        );

        return {
            dstNumber,
            callerId,
            numberInfo,
        };
        
    }
}