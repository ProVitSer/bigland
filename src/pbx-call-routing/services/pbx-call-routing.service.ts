import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PbxCallRoutingModelService } from './pbx-call-routing-model.service';
import { OperatorsService } from '@app/operators/operators.service';
import { LogService } from '@app/log/log.service';
import { ExtensionRouteInfo } from '../interfaces/pbx-call-routing.interfaces';
import { EXTENSION_ROUTE_PROJ } from '../pbx-call-routing.constants';
import { UpdateGroupRouteDTO } from '../dto/update-group-route.dto';
import { AddExtensionRouteDTO } from '../dto/add-extension-route.dto';
import { PbxGroup, PbxRoutingStrategy } from '../interfaces/pbx-call-routing.enum';

@Injectable()
export class PbxCallRoutingService {
  constructor(
    private readonly log: LogService,
    private readonly pbxCallRoutingModelService: PbxCallRoutingModelService,
    private readonly operatorsService: OperatorsService,
  ) {}

  public async getExtensionRouteInfo(extension: string): Promise<ExtensionRouteInfo> {
    try {
      const extInfo = await this.pbxCallRoutingModelService.getPbxCallRouting({ extension }, EXTENSION_ROUTE_PROJ);
      if (extInfo == null) throw new HttpException({ message: `Добавочный номер ${extension} не найден` }, HttpStatus.NOT_FOUND);
      const operatorInfo = await this.operatorsService.getOperatorById(extInfo.operatorId);
      return {
        localExtension: extInfo.localExtension,
        operatorsName: operatorInfo.name,
        extensionGroup: extInfo.group,
        staticCID: extInfo.staticCID,
      };
    } catch (e) {
      throw e;
    }
  }

  public async updateGroupRoute(data: UpdateGroupRouteDTO): Promise<boolean> {
    try {
      const { operatorId } = await this.operatorsService.getOperator(data.operatorName);
      await this.pbxCallRoutingModelService.updateOperatorIdForGroup(operatorId, data.groupName);
      return true;
    } catch (e) {
      throw e;
    }
  }

  public async addExtensionRoute(data: AddExtensionRouteDTO): Promise<void> {
    try {
      const { operatorId } = await this.operatorsService.getOperator(data.operatorName);
      await this.pbxCallRoutingModelService.create({
        operatorId,
        localExtension: data.localExtension,
        group: data.groupName || PbxGroup.manager,
        routingStrategy: !!data.staticCID ? PbxRoutingStrategy.static : PbxRoutingStrategy.roundRobin,
        ...(!!data.staticCID ? { staticCID: data.staticCID } : {}),
      });
    } catch (e) {
      throw e;
    }
  }
}
