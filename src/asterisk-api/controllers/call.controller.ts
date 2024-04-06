import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { CallApiService } from '../services/call-api.service';
import { MonitoringCallDTO } from '../dto/monitoring-call.dto';
import { ApiHttpExceptionFilter } from '@app/http/http-exception.filter';
import { PozvonimCallDTO } from '../dto/pozvomin.dto';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MonitoringCallResult, PozvonimCallResult } from '../interfaces/asterisk-api.interfaces';

@ApiTags('asterisk-api')
@Controller('asterisk-api/call')
@UseGuards(RoleGuard([Role.Admin, Role.Api]))
@UseGuards(JwtGuard)
@UseFilters(ApiHttpExceptionFilter)
export class CallApiController {
    constructor(private readonly apiService: CallApiService, private readonly http: HttpResponseService) {}

    @Post('monitoringCall')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Звонок на номера и озвучивание "Проверка работоспособности номера"'
    })
    @ApiBody({
        type: MonitoringCallDTO
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Обновленный пароль прослушки chanSpy',
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
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Инициация двустороннего обратного вызова'
    })
    @ApiBody({
        type: PozvonimCallDTO
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Обновленный пароль прослушки chanSpy',
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
}