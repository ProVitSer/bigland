import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { CallApiService } from '../services/call-api.service';
import { ApiHttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChannelStatusResult, HangupCallResult, MonitoringCallResult, OriginateCallResult, PozvonimCallResult, TransferResult } from '../interfaces/asterisk-api.interfaces';
import { ChannelStateDTO, HangupCallDTO, OriginateCallDTO, PozvonimCallDTO, MonitoringCallDTO } from '../dto';
import { TransferDTO } from '../dto/transfer.dto';

@ApiTags('asterisk-api')
@Controller('asterisk-api/call')
@UseGuards(JwtGuard)
@UseFilters(ApiHttpExceptionFilter)
export class CallApiController {
    constructor(private readonly apiService: CallApiService, private readonly http: HttpResponseService) {}

    @Post('monitoringCall')
    @UseGuards(RoleGuard([Role.Admin, Role.Api]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Звонок на номера и озвучивание "Проверка работоспособности номера"'
    })
    @ApiBody({
        type: MonitoringCallDTO
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат инициации вызова для "Проверка работоспособности номера"',
        type: [MonitoringCallResult],
    })
    async monitoringCall(@Req() req: Request, @Body() body: MonitoringCallDTO, @Res() res: Response) {
        try {

            const callResult = await this.apiService.sendMonitoringCall(body);

            return this.http.response(req, res, HttpStatus.OK, callResult);

        } catch (e) {

            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    @Post('pozvonim')
    @UseGuards(RoleGuard([Role.Admin, Role.Api]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Инициация обратного вызова через "Pozvonim"'
    })
    @ApiBody({
        type: PozvonimCallDTO
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат инициации вызова для "Pozvonim"',
        type: PozvonimCallResult,
    })
    async pozvonimCall(@Req() req: Request, @Body() body: PozvonimCallDTO, @Res() res: Response) {
        try {

            const callResult = await this.apiService.pozvonimOutCall(body);

            return this.http.response(req, res, HttpStatus.OK, callResult);

        } catch (e) {

            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);
            
        }
    }


    @Post('originate')
    @UseGuards(RoleGuard([Role.Admin, Role.Dev, Role.Api]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Инициация callback вызова между двумя внутренними номерами'
    })
    @ApiBody({
        type: OriginateCallDTO
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат инициации callback вызова между двумя внутренними номерами',
        type: OriginateCallResult,
    })
    async originate(@Req() req: Request, @Body() body: OriginateCallDTO, @Res() res: Response) {
        try {

            const originateResult = await this.apiService.originate(body);

            return this.http.response(req, res, HttpStatus.OK, originateResult);

        } catch (e) {

            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);
            
        }
    }


    @Post('hangup')
    @UseGuards(RoleGuard([Role.Admin, Role.Dev, Role.Api]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Завершение вызова по каналу'
    })
    @ApiBody({
        type: HangupCallDTO
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат завершения вызова по каналу',
        type: HangupCallResult,
    })
    async hangup(@Req() req: Request, @Body() body: HangupCallDTO, @Res() res: Response) {
        try {

            const hangupResult = await this.apiService.hangup(body);

            return this.http.response(req, res, HttpStatus.OK, hangupResult);

        } catch (e) {

            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);
            
        }
    }


    @Post('channel-state')
    @UseGuards(RoleGuard([Role.Admin, Role.Dev, Role.Api]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Получение статуса канала'
    })
    @ApiBody({
        type: ChannelStateDTO
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат статуса канала',
        type: ChannelStatusResult,
    })
    async status(@Req() req: Request, @Body() body: ChannelStateDTO, @Res() res: Response) {
        try {

            const hangupResult = await this.apiService.channeStatus(body);

            return this.http.response(req, res, HttpStatus.OK, hangupResult);

        } catch (e) {

            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);
            
        }
    }


    @Post('transfer')
    @UseGuards(RoleGuard([Role.Admin, Role.Dev, Role.Api]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Перевод вызова'
    })
    @ApiBody({
        type: TransferDTO
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат перевода вызова',
        type: TransferResult,
    })
    async transfer(@Req() req: Request, @Body() body: TransferDTO, @Res() res: Response) {
        try {

            const hangupResult = await this.apiService.transfer(body);

            return this.http.response(req, res, HttpStatus.OK, hangupResult);

        } catch (e) {

            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);
            
        }
    }
}

