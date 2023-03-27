import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { CallApiService } from '../services/call-api.service';
import { MonitoringCallDTO } from '../dto/monitoring-call.dto';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { PozvonimCallDTO } from '../dto/pozvomin.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { MonitoringCallResult, PozvonimCallResult } from '../interfaces/asterisk-api.interfaces';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { SwaggerApiBadResponse, SwaggerHttpErrorResponseMap } from '@app/http/interfaces/http.interfaces';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { CheckSpamDTO } from '../dto/check-spam.dto';
import { AsteriskApiService } from '../services/asterisk-api.service';

@ApiTags('call')
@ApiBadRequestResponse(SwaggerHttpErrorResponseMap[SwaggerApiBadResponse.ApiBadRequestResponse])
@ApiInternalServerErrorResponse(SwaggerHttpErrorResponseMap[SwaggerApiBadResponse.ApiInternalServerErrorResponse])
@ApiBearerAuth('JWT-auth')
@UseFilters(HttpExceptionFilter)
@Controller('call')
export class CallApiController {
  constructor(
    private readonly apiService: CallApiService,
    private readonly http: HttpResponseService,
    private readonly asteriskApiService: AsteriskApiService,
  ) {}

  @ApiOperation({ summary: 'Отправка тестового вызова' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: MonitoringCallResult,
    isArray: true,
  })
  @ApiBody({ type: MonitoringCallDTO })
  @UseGuards(RoleGuard(Role.Admin))
  @UseGuards(JwtGuard)
  @Post('monitoringCall')
  async monitoringCall(@Req() req: Request, @Body() body: MonitoringCallDTO, @Res() res: Response) {
    try {
      const callResult = await this.apiService.sendMonitoringCall(body);
      return this.http.response(req, res, HttpStatus.OK, callResult);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Отправка вызова аналог Позвони' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: PozvonimCallResult,
  })
  @ApiBody({ type: PozvonimCallDTO })
  @UseGuards(RoleGuard(Role.Admin))
  @UseGuards(JwtGuard)
  @Post('pozvonim')
  async pozvonimCall(@Req() req: Request, @Body() body: PozvonimCallDTO, @Res() res: Response) {
    try {
      const callResult = await this.apiService.pozvonimOutCall(body);
      return this.http.response(req, res, HttpStatus.OK, callResult);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(RoleGuard(Role.User))
  @UseGuards(JwtGuard)
  @Post('checkSpam')
  async checkSpam(@Req() req: Request, @Body() body: CheckSpamDTO, @Res() res: Response) {
    try {
      const result = await this.asteriskApiService.checkSpamNumber(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
