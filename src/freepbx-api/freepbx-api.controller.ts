import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { ApiHttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { FreePBXCreateUsersDto } from './dto/freepbx-create-users.dto';
import { FreepbxUsersApiService } from './freepbx-api-users.service';
import { Request, Response } from 'express';
import { Role } from '@app/users/interfaces/users.enum';
import { FreePBXDeleteUsersDto } from './dto/freepbx-delete-users.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUsersData, DeleteUsersResponse } from './interfaces/freepbx-api.interfaces';

@ApiTags('freepbx-api')
@Controller('freepbx-api')
@UseGuards(RoleGuard([Role.Admin, Role.Api]))
@UseGuards(JwtGuard)
@UseFilters(ApiHttpExceptionFilter)
export class FreepbxApiController {
    constructor(private readonly http: HttpResponseService, private readonly freepbxUsersApi: FreepbxUsersApiService) {}

    @Post('create-users')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Изменение статуса dnd добавочных номеров'
    })
    @ApiBody({
        type: FreePBXCreateUsersDto
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат изменения статуса dnd внутренних номеров',
        type: CreateUsersData,
    })
    async createUsers(@Req() req: Request, @Res() res: Response, @Body() body: FreePBXCreateUsersDto) {
        try {

            const result = await this.freepbxUsersApi.createUsers(body);

            return this.http.response(req, res, HttpStatus.OK, result);

        } catch (e) {

            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    @Post('delete-users')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Изменение статуса dnd добавочных номеров'
    })
    @ApiBody({
        type: FreePBXDeleteUsersDto
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат изменения статуса dnd внутренних номеров',
        type: DeleteUsersResponse,
    })
    async deleteUsers(@Req() req: Request, @Res() res: Response, @Body() body: FreePBXDeleteUsersDto) {
        try {

            const result = await this.freepbxUsersApi.deleteUsers(body);

            return this.http.response(req, res, HttpStatus.OK, result);

        } catch (e) {

            throw new HttpException({
                message: e?.message || e
            }, HttpStatus.INTERNAL_SERVER_ERROR);
            
        }
    }
}