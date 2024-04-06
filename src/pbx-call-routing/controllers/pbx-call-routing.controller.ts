import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { ApiHttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Role } from '@app/users/interfaces/users.enum';
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { PbxCallRoutingService } from '../services/pbx-call-routing.service';
import { ExtensionRouteDTO } from '../dto/extension-route.dto';
import { UpdateGroupRouteDTO } from '../dto/update-group-route.dto';
import { AddExtensionRouteDTO } from '../dto/add-extension-route.dto';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ExtensionRouteInfo } from '../interfaces/pbx-call-routing.interfaces';

@ApiTags('pbx-call-routing')
@Controller('pbx-call-routing')
@UseGuards(RoleGuard([Role.Admin, Role.Api]))
@UseGuards(JwtGuard)
@UseFilters(ApiHttpExceptionFilter)
export class PbxCallRoutingController {
    constructor(private readonly http: HttpResponseService, private readonly pbxCallRoutingService: PbxCallRoutingService) {}

    @ApiBearerAuth()
    @Get('extension-route/:extension')
    @ApiOperation({
        summary: 'Получение информации по маршрутизации добавочного номера'
    })
    @ApiParam({
        name: 'extension',
        required: true,
        description: 'Внутренний номер',
        type: String,
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Маршрутная информация',
        type: ExtensionRouteInfo,
    })
    async getExtensionRoute(@Req() req: Request, @Param() params: ExtensionRouteDTO, @Res() res: Response) {
        try {
            
            const result = await this.pbxCallRoutingService.getExtensionRouteInfo(params.extension);

            return this.http.response(req, res, HttpStatus.OK, result);

        } catch (e) {

            throw e;

        }
    }

    @Post('update/group')
    @ApiExcludeEndpoint()
    async updateGroupRoute(@Req() req: Request, @Body() body: UpdateGroupRouteDTO, @Res() res: Response) {
        try {

            const result = await this.pbxCallRoutingService.updateGroupRoute(body);

            return this.http.response(req, res, HttpStatus.OK, {
                result
            });

        } catch (e) {

            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    @Post('add')
    @ApiExcludeEndpoint()
    async addExtensionsRoute(@Req() req: Request, @Body() body: AddExtensionRouteDTO, @Res() res: Response) {
        try {

            const result = await this.pbxCallRoutingService.addExtensionsRoute(body.extensionRoutes);

            return this.http.response(req, res, HttpStatus.OK, result);

        } catch (e) {

            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }
}