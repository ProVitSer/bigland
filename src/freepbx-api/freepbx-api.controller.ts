import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUsersDto } from './dto/create-users.dto';
import { FreepbxUsersApiService } from './freepbx-api-users.service';
import { ResultCreateUsers } from './interfaces/freepbx-api.interfaces';
import { Request, Response } from 'express';
import {
  SwaggerApiBadResponse,
  SwaggerHttpErrorResponseMap,
} from '@app/http/interfaces/http.interfaces';
import { Role } from '@app/users/interfaces/users.enum';

@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
@ApiTags('freepbx-api')
@ApiBadRequestResponse(
  SwaggerHttpErrorResponseMap[SwaggerApiBadResponse.ApiBadRequestResponse],
)
@ApiInternalServerErrorResponse(
  SwaggerHttpErrorResponseMap[
    SwaggerApiBadResponse.ApiInternalServerErrorResponse
  ],
)
@ApiBearerAuth('JWT-auth')
@Controller('freepbx-api')
export class FreepbxApiController {
  constructor(
    private readonly http: HttpResponseService,
    private readonly freepbxUsersApi: FreepbxUsersApiService,
  ) {}

  @ApiOperation({ summary: 'Запрос на создание добавочных номеров' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: ResultCreateUsers,
  })
  @ApiBody({ type: CreateUsersDto })
  @UseGuards(RoleGuard(Role.Admin))
  @Post('users')
  async createUsers(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateUsersDto,
  ) {
    try {
      const result = await this.freepbxUsersApi.createUsers(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
