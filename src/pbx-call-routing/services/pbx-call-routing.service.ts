import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PbxCallRoutingModelService } from './pbx-call-routing-model.service';
import { OperatorsService } from '@app/operators/operators.service';
import { ExtensionRouteInfo } from '../interfaces/pbx-call-routing.interfaces';
import { EXTENSION_ROUTE_PROJ } from '../pbx-call-routing.constants';
import { UpdateGroupRouteDTO } from '../dto/update-group-route.dto';
import { ExtensionRouteItem } from '../dto/add-extension-route.dto';
import { PbxGroup, PbxRoutingStrategy } from '../interfaces/pbx-call-routing.enum';

@Injectable()
export class PbxCallRoutingService {
  constructor(
    private readonly pbxCallRoutingModelService: PbxCallRoutingModelService,
    private readonly operatorsService: OperatorsService,
  ) {}

  public async getExtensionRouteInfo(extension: string): Promise<ExtensionRouteInfo> {
    try {
      const extInfo = await this.pbxCallRoutingModelService.getPbxCallRouting({ localExtension: extension }, EXTENSION_ROUTE_PROJ);
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

  public async addExtensionsRoute(data: ExtensionRouteItem[]): Promise<void> {
    try {
      for (const ext of data) {
        const { operatorId } = await this.operatorsService.getOperator(ext.operatorName);
        await this.pbxCallRoutingModelService.create({
          operatorId,
          localExtension: ext.localExtension,
          group: ext.groupName || PbxGroup.manager,
          routingStrategy: !!ext.staticCID ? PbxRoutingStrategy.static : PbxRoutingStrategy.roundRobin,
          ...(!!ext.staticCID ? { staticCID: ext.staticCID } : {}),
        });
      }
    } catch (e) {
      throw e;
    }
  }

  public async deleteExtensionRoute(extension: string) {
    try {
      return await this.pbxCallRoutingModelService.delete({ localExtension: extension });
    } catch (e) {
      throw e;
    }
  }
}
