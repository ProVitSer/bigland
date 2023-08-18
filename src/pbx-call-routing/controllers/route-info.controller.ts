import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { GetRoutingInfoData } from '../interfaces/pbx-call-routing.interfaces';
import { PbxCallRoutingService } from '../services/pbx-call-routing.service';

@Controller('pbx-call-routing')
export class RouteInfoController {
  constructor(private readonly pbxCallRoutingService: PbxCallRoutingService) {}
  @Get('route-info')
  async getRouteInfo(@Query() query: GetRoutingInfoData, @Res() res: Response) {
    try {
      return res.json({ operatorTrunkNumber: 2, callerId: '712345678', number: '712345678' });
    } catch (e) {
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }
}
