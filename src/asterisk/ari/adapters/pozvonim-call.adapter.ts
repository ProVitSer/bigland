import { PozvominCall } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { OperatorsService } from '@app/operators/operators.service';
import { OperatorsUtils } from '@app/operators/operators.utils';
import { Injectable } from '@nestjs/common';
import { AsteriskContext, ChannelType } from '../../interfaces/asterisk.enum';
import { AsteriskAriOriginate } from '../../interfaces/asterisk.interfaces';

@Injectable()
export class PozvonimCallDataAdapter {
  public readonly operator: OperatorsName = OperatorsName.mango;
  public readonly accountcode: string = 'Pozvonim';
  constructor(private readonly operatorsService: OperatorsService) {}

  public async getOriginateInfo(data: PozvominCall): Promise<AsteriskAriOriginate> {
    const operatorInfo = await this.operatorsService.getOperator(this.operator);
    const numberInfo = operatorInfo.numbers[Math.floor(Math.random() * operatorInfo.numbers.length)];
    const { dstNumber, callerId } = OperatorsUtils.formatOperatorNumber(
      operatorInfo.formatNumber,
      data.DST_NUM,
      String(numberInfo.callerId),
    );

    return {
      endpoint: `${ChannelType.PJSIP}/${data.SIP_ID}`,
      callerId: dstNumber,
      context: AsteriskContext.pozvonim,
      extension: data.SIP_ID,
      variables: {
        dstNumber: dstNumber,
        accountcode: this.accountcode,
        localExtension: data.SIP_ID,
        outSuffix: numberInfo.outSuffix,
        trunkCIDOverride: callerId,
        pbxTrunkNumber: numberInfo.pbxTrunkNumber,
      },
    };
  }
}
