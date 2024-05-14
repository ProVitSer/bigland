import { ApiHttpExceptionFilter } from '@app/http/http-exception.filter';
import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ServiceCodeApiService } from '../services/service-code-api.service';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SetDNDStatusResult } from '@app/asterisk/ami/interfaces/ami.interfaces';
import { ExtensionsStateService } from '../services/extensions-state.service';
import { ActualExtensionsState, DndExtensionsStatus } from '../interfaces/asterisk-api.interfaces';
import { RateLimiterGuard } from 'nestjs-rate-limiter';
import { DNDDto } from '../dto';

@ApiTags('asterisk-api')
@Controller('asterisk-api/service')
@UseGuards(JwtGuard)
@UseFilters(ApiHttpExceptionFilter)
export class ServiceCodeApiController {
    constructor(
        private readonly serviceCode: ServiceCodeApiService,
        private readonly http: HttpResponseService,
        private readonly extensionsStateService: ExtensionsStateService,
    ) {}

    @Post('dnd')
    @UseGuards(RoleGuard([Role.Admin, Role.Api]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Изменение статуса dnd добавочных номеров'
    })
    @ApiBody({
        type: DNDDto
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат изменения статуса dnd внутренних номеров',
        type: SetDNDStatusResult,
    })
    async setDnd(@Req() req: Request, @Body() body: DNDDto, @Res() res: Response) {
        try {

            const resultSet = await this.serviceCode.setDndStatus(body);

            return this.http.response(req, res, HttpStatus.OK, [resultSet]);

        } catch (e) {

            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);
            
        }
    }

    @Get('extensions-state')
    @UseGuards(RoleGuard([Role.Admin, Role.Api, Role.Dev]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Получить актуальное состояние внутренних номеров'
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Актуальное состояние внутренних номеров',
        type: ActualExtensionsState,
    })
    async getExtensionsState(@Req() req: Request, @Res() res: Response) {
        try {
            const result = await this.extensionsStateService.getExtensionsState();
            return this.http.response(req, res, HttpStatus.OK, result);
        } catch (e) {
            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(RateLimiterGuard)
    @Get('dnd')
    @UseGuards(RoleGuard([Role.Admin, Role.Api, Role.Dev]))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Получить актуальный список снутренних номеров со статус Do Not Disturb (DND)'
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: '',
        type: DndExtensionsStatus,
    })
    async getDndStatus(@Req() req: Request, @Res() res: Response) {
        try {
            const result = await this.extensionsStateService.getDndStatus();
            return this.http.response(req, res, HttpStatus.OK, result);
        } catch (e) {
            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
