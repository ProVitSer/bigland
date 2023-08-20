import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PbxCallData } from '../interfaces/pbx-call-routing.interfaces';
import { RoutingInfoService } from '../services/routing-info.service';

@Controller('pbx-call-routing')
export class RouteInfoController {
  constructor(private readonly routingInfoService: RoutingInfoService) {}

  @Get('route-info')
  async getRouteInfo(@Query() pbxCallData: PbxCallData, @Res() res: Response) {
    try {
      const result = await this.routingInfoService.getRoutingInfo(pbxCallData);
      return res.json(result);
    } catch (e) {
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }
}
