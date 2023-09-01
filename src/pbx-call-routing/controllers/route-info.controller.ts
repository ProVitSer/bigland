import { Controller, Get, HttpStatus, Query, Res, Req, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PbxCallData } from '../interfaces/pbx-call-routing.interfaces';
import { RoutingInfoService } from '../services/routing-info.service';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';

@Controller('pbx-call-routing')
@UseGuards(RoleGuard([Role.Admin, Role.Asterisk]))
@UseGuards(JwtGuard)
export class RouteInfoController {
  constructor(private readonly routingInfoService: RoutingInfoService) {}

  @Get('route-info')
  async getRouteInfo(@Req() req: any, @Query() pbxCallData: PbxCallData, @Res() res: Response) {
    try {
      const result = await this.routingInfoService.getRoutingInfo(pbxCallData);
      return res.json(result);
    } catch (e) {
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }
}
