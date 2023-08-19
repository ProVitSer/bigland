import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PbxCallData } from '../interfaces/pbx-call-routing.interfaces';
import { PbxCallRoutingService } from '../services/pbx-call-routing.service';

@Controller('pbx-call-routing')
export class RouteInfoController {
  constructor(private readonly pbxCallRoutingService: PbxCallRoutingService) {}

  @Get('route-info')
  async getRouteInfo(@Query() pbxCallData: PbxCallData, @Res() res: Response) {
    try {
      const result = await this.pbxCallRoutingService.getRoutingInfo(pbxCallData);
      return res.json(result);
    } catch (e) {
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }
}
