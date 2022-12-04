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
import {
  GsmPortsActionService,
  GsmSendSMSActionService,
  GsmUSSDActionService,
} from './gsm/gsm-action-service';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { USSDDto } from './dto/ussd.dto';
import { HttpResponseService } from '@app/http/http-response';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  GsmPortFormatInfo,
  GsmPortsFormatInfo,
  ScheduledSMSData,
  SMSData,
} from './interfaces/gsm-gateway-api.interfaces';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import {
  SwaggerApiBadResponse,
  SwaggerHttpErrorResponseMap,
} from '@app/http/interfaces/http.interfaces';
import { Role } from '@app/users/interfaces/users.enum';
import { Sms } from './sms/sms.schema';

@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
@ApiTags('gsm-gateway')
@ApiBadRequestResponse(
  SwaggerHttpErrorResponseMap[SwaggerApiBadResponse.ApiBadRequestResponse],
)
@ApiInternalServerErrorResponse(
  SwaggerHttpErrorResponseMap[
    SwaggerApiBadResponse.ApiInternalServerErrorResponse
  ],
)
@ApiBearerAuth('JWT-auth')
@Controller('gsm-gateway')
export class GsmGatewayApiController {
  constructor(
    private readonly http: HttpResponseService,
    private readonly gsmSms: GsmSendSMSActionService,
    private readonly gsmPorts: GsmPortsActionService,
    private readonly ussd: GsmUSSDActionService,
  ) {}

  @UseGuards(RoleGuard(Role.Admin))
  @ApiOperation({ summary: 'Отправка смс сообщений через GSM шлюз' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: SMSData,
  })
  @ApiBody({ type: SMSDto })
  @Post('sms/send')
  @HttpCode(200)
  async sendSms(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: SMSDto,
  ) {
    try {
      const result = await this.gsmSms.send(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Получение информации по смс сообщению' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: SMSData,
  })
  @Get('sms')
  async getSmsStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Query('unicid') unicid: string,
  ) {
    try {
      const result = await this.gsmSms.getSmsInfo(unicid);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Создание отложенной отправки смс сообщения' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: ScheduledSMSData,
  })
  @ApiBody({ type: SMSDtoScheduled })
  @Post('sms/scheduledSend')
  @HttpCode(200)
  async scheduledSend(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: SMSDtoScheduled,
  ) {
    try {
      const result = await this.gsmSms.scheduledSend(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Получение списка отложенных смс сообщений' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: Sms,
    isArray: true,
  })
  @Get('sms/scheduledSend')
  async getScheduledSend(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.gsmSms.getScheduledSend();
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Удалить смс сообщение' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    schema: {
      properties: {
        result: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @Delete('sms')
  async deleteSms(
    @Req() req: Request,
    @Res() res: Response,
    @Query('unicid') unicid: string,
  ) {
    try {
      const result = await this.gsmSms.deleteSms(unicid);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({
    summary:
      'Получить информацию по порту gsm шлюза. В не форматированном возвращает объект самого шлюза',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: GsmPortFormatInfo,
  })
  @Get('port')
  async getPortInfo(
    @Req() req: Request,
    @Res() res: Response,
    @Query('portNumber') port: string,
    @Query('format') format?: string,
  ) {
    try {
      const bFormat = !!format && format === 'true' ? true : false;
      const result = await this.gsmPorts.getPortInfo(port, bFormat);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Получить информацию по всем порта gsm шлюза' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: GsmPortsFormatInfo,
    isArray: true,
  })
  @Get('ports')
  async getPortsInfo(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.gsmPorts.getAllPorts();
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({
    summary:
      'Отправить ussd запрос. На симках обязательно должен быть включен ussd иначе ошибка',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: 'string',
  })
  @ApiBody({ type: USSDDto })
  @Post('ussd')
  @HttpCode(200)
  async sendUSSD(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: USSDDto,
  ) {
    try {
      const result = await this.ussd.sendUSSD(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
