import { PozvominCall } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { OperatorsService } from '@app/operators/operators.service';
import { OperatorsUtils } from '@app/operators/operators.utils';
import { Injectable } from '@nestjs/common';
import { AsteriskContext, ChannelType } from '../../interfaces/asterisk.enum';
import { AsteriskAriOriginate } from '../../interfaces/asterisk.interfaces';
import {
  POZVONIM_CALL_LOCAL_PREFIX,
  POZVONIM_CALL_CC_PREFIX,
  POZVONIM_LOCAL_EXTENSION_TIMEOUT,
  POZVONIM_GROUP_TIMEOUT,
} from '../ari.constants';
import { PozvonimOperatorInfoData, PozvonimOriginateInfo } from '../interfaces/ari.interfaces';

@Injectable()
export class PozvonimCallDataAdapter {
  public readonly operator: OperatorsName = OperatorsName.mango;
  public readonly accountcode: string = 'Pozvonim';
  constructor(private readonly operatorsService: OperatorsService) {}

  public async getLocalExtensionOriginateInfo(data: PozvominCall): Promise<AsteriskAriOriginate> {
    return await this.getOriginateInfo(data, POZVONIM_CALL_LOCAL_PREFIX, POZVONIM_LOCAL_EXTENSION_TIMEOUT);
  }

  public async getCCOriginateInfo(data: PozvominCall): Promise<AsteriskAriOriginate> {
    return await this.getOriginateInfo(data, POZVONIM_CALL_CC_PREFIX, POZVONIM_GROUP_TIMEOUT);
  }

  private async getOriginateInfo(data: PozvominCall, prefix: string, timeout: number): Promise<PozvonimOriginateInfo> {
    const info = await this.getOperatorInfo(data);

    return {
      endpoint: `${ChannelType.LOCAL}/${prefix}${data.SIP_ID}@${AsteriskContext.fromInternalAdditional}`,
      callerId: info.dstNumber,
      context: AsteriskContext.pozvonim,
      extension: data.SIP_ID,
      timeout,
      variables: {
        dstNumber: info.dstNumber,
        accountcode: this.accountcode,
        localExtension: data.SIP_ID,
        outSuffix: info.numberInfo.outSuffix,
        trunkCIDOverride: info.callerId,
        pbxTrunkNumber: info.numberInfo.pbxTrunkNumber,
      },
    };
  }

  private async getOperatorInfo(data: PozvominCall): Promise<PozvonimOperatorInfoData> {
    const operatorInfo = await this.operatorsService.getOperator(this.operator);
    const numberInfo = operatorInfo.numbers[Math.floor(Math.random() * operatorInfo.numbers.length)];
    const { dstNumber, callerId } = OperatorsUtils.formatOperatorNumber(
      operatorInfo.formatNumber,
      data.DST_NUM,
      String(numberInfo.callerId),
    );
    return {
      dstNumber,
      callerId,
      numberInfo,
    };
  }
}
