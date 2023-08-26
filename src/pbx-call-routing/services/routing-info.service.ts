import { Injectable } from '@nestjs/common';
import { PbxCallRoutingModelService } from './pbx-call-routing-model.service';
import { OperatorsService } from '@app/operators/operators.service';
import { AggregateCallData, PbxCallData, RoutingData } from '../interfaces/pbx-call-routing.interfaces';
import { LogService } from '@app/log/log.service';
import { NumbersInfo, Operators } from '@app/operators/operators.schema';
import { OperatorsUtils } from '@app/operators/operators.utils';
import { FormatOperatorNumber } from '@app/operators/interfaces/operators.interfaces';
import { PbxRoutingStrategy } from '../interfaces/pbx-call-routing.enum';
import { DEFAULT_ROUTING_OPERATOR, PBX_ROUTING_STR_ERROR, PREFIX_NUMBER } from '../pbx-call-routing.constants';

@Injectable()
export class RoutingInfoService {
  constructor(
    private readonly log: LogService,
    private readonly pbxCallRoutingModelService: PbxCallRoutingModelService,
    private readonly operatorsService: OperatorsService,
  ) {}

  public async getRoutingInfo(pbxCallData: PbxCallData): Promise<RoutingData> {
    try {
      const pbxCallRoutingInfo = await this.pbxCallRoutingModelService.getPbxCallRouting({
        localExtension: this.formatLocalExtension(pbxCallData.localExtension),
      });
      if (pbxCallRoutingInfo == null) return this.getDefaultRoute(pbxCallData);
      const operatorInfo = await this.operatorsService.getOperatorById(pbxCallRoutingInfo.operatorId);
      return this._getRoutingInfo({ pbxCallData, pbxCallRoutingInfo, operatorInfo });
    } catch (e) {
      this.log.error(`${e} ${JSON.stringify(pbxCallData)}`, RoutingInfoService.name);
      throw e;
    }
  }

  private async getDefaultRoute(pbxCallData: PbxCallData): Promise<RoutingData> {
    const operator = await this.operatorsService.getOperator(DEFAULT_ROUTING_OPERATOR);
    const { dstNumber, callerId } = this.formatNumbers(operator, pbxCallData.externalNumber, operator.numbers[0].callerId);
    return {
      callerId: callerId,
      pbxTrunkNumber: operator.numbers[0].pbxTrunkNumber,
      formatOutboundNumber: dstNumber,
    };
  }

  private formatLocalExtension(localExtension: string): string {
    return localExtension.length == 6 ? localExtension.slice(PREFIX_NUMBER) : localExtension;
  }

  private _getRoutingInfo(data: AggregateCallData): RoutingData {
    switch (data.pbxCallRoutingInfo.routingStrategy) {
      case PbxRoutingStrategy.static:
        return this.getStaticRoutingData(data);
      case PbxRoutingStrategy.roundRobin:
        return this.getRoundRobinRoutingData(data);
      default:
        throw PBX_ROUTING_STR_ERROR;
    }
  }

  private getStaticRoutingData(data: AggregateCallData): RoutingData {
    const { dstNumber, callerId } = this.formatNumbers(
      data.operatorInfo,
      data.pbxCallData.externalNumber,
      data.pbxCallRoutingInfo.staticCID,
    );
    return {
      callerId: callerId,
      pbxTrunkNumber: data.operatorInfo.numbers[0].pbxTrunkNumber,
      formatOutboundNumber: dstNumber,
    };
  }

  private getRoundRobinRoutingData(data: AggregateCallData): RoutingData {
    const randomNumberInfo = this.getRandomNumber(data.operatorInfo);
    const { dstNumber, callerId } = this.formatNumbers(data.operatorInfo, data.pbxCallData.externalNumber, randomNumberInfo.callerId);
    this.operatorsService.increaseCallerIdCount(callerId);
    return {
      callerId: callerId,
      pbxTrunkNumber: randomNumberInfo.pbxTrunkNumber,
      formatOutboundNumber: dstNumber,
    };
  }

  private formatNumbers(operatorInfo: Operators, dstNumber: string, callerId: string): FormatOperatorNumber {
    return OperatorsUtils.formatOperatorNumber(operatorInfo.formatNumber, dstNumber, callerId);
  }

  private getRandomNumber(operatorInfo: Operators): NumbersInfo {
    const minCounter = Math.min(...operatorInfo.numbers.map((number: NumbersInfo) => number.callCount));
    const smallestCounters = operatorInfo.numbers.filter((number: NumbersInfo) => number.callCount === minCounter);
    const randomIndex = Math.floor(Math.random() * smallestCounters.length);
    const selectedNumberObj = smallestCounters[randomIndex];
    return selectedNumberObj;
  }
}
