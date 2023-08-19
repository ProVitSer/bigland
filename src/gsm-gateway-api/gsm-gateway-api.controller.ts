import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { SMSDto, SMSDtoScheduled } from './dto/sms.dto';
import { Request, Response } from 'express';
import { GsmPortsActionService, GsmSendSMSActionService, GsmUSSDActionService } from './gsm/gsm-action-service';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { USSDDto } from './dto/ussd.dto';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';

@Controller('gsm-gateway')
@UseGuards(RoleGuard([Role.Admin]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
export class GsmGatewayApiController {
  constructor(
    private readonly http: HttpResponseService,
    private readonly gsmSms: GsmSendSMSActionService,
    private readonly gsmPorts: GsmPortsActionService,
    private readonly ussd: GsmUSSDActionService,
  ) {}

  @Post('sms/send')
  @HttpCode(200)
  async sendSms(@Req() req: Request, @Res() res: Response, @Body() body: SMSDto) {
    try {
      const result = await this.gsmSms.send(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('sms')
  async getSmsStatus(@Req() req: Request, @Res() res: Response, @Query('unicid') unicid: string) {
    try {
      const result = await this.gsmSms.getSmsInfo(unicid);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('sms/scheduledSend')
  @HttpCode(200)
  async scheduledSend(@Req() req: Request, @Res() res: Response, @Body() body: SMSDtoScheduled) {
    try {
      const result = await this.gsmSms.scheduledSend(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('sms/scheduledSend')
  async getScheduledSend(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.gsmSms.getScheduledSend();
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('sms')
  async deleteSms(@Req() req: Request, @Res() res: Response, @Query('unicid') unicid: string) {
    try {
      const result = await this.gsmSms.deleteSms(unicid);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('port')
  async getPortInfo(@Req() req: Request, @Res() res: Response, @Query('portNumber') port: string, @Query('format') format?: string) {
    try {
      const bFormat = !!format && format === 'true' ? true : false;
      const result = await this.gsmPorts.getPortInfo(port, bFormat);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('ports')
  async getPortsInfo(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.gsmPorts.getAllPorts();
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('ussd')
  @HttpCode(200)
  async sendUSSD(@Req() req: Request, @Res() res: Response, @Body() body: USSDDto) {
    try {
      const result = await this.ussd.sendUSSD(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
