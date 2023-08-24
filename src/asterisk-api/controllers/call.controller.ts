import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { CallApiService } from '../services/call-api.service';
import { MonitoringCallDTO } from '../dto/monitoring-call.dto';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { PozvonimCallDTO } from '../dto/pozvomin.dto';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';

@Controller('call')
@UseGuards(RoleGuard([Role.Admin, Role.Api]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
export class CallApiController {
  constructor(private readonly apiService: CallApiService, private readonly http: HttpResponseService) {}

  @Post('monitoringCall')
  async monitoringCall(@Req() req: Request, @Body() body: MonitoringCallDTO, @Res() res: Response) {
    try {
      const callResult = await this.apiService.sendMonitoringCall(body);
      return this.http.response(req, res, HttpStatus.OK, callResult);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('pozvonim')
  async pozvonimCall(@Req() req: Request, @Body() body: PozvonimCallDTO, @Res() res: Response) {
    try {
      const callResult = await this.apiService.pozvonimOutCall(body);
      return this.http.response(req, res, HttpStatus.OK, callResult);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
