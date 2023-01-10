import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ChanspyApiService } from '../services/chanspy-api.service';
import { Request, Response } from 'express';
import { ChanspyDto } from '../dto/chanspy.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ChanspyPasswordResult } from '../interfaces/asterisk-api.interfaces';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import {
  SwaggerApiBadResponse,
  SwaggerHttpErrorResponseMap,
} from '@app/http/interfaces/http.interfaces';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';

@ApiTags('chanspy')
@ApiBadRequestResponse(
  SwaggerHttpErrorResponseMap[SwaggerApiBadResponse.ApiBadRequestResponse],
)
@ApiInternalServerErrorResponse(
  SwaggerHttpErrorResponseMap[
    SwaggerApiBadResponse.ApiInternalServerErrorResponse
  ],
)
@ApiBearerAuth('JWT-auth')
@UseGuards(RoleGuard(Role.Admin))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
@Controller('chanspy')
export class ChanspyApiController {
  constructor(
    private readonly chanspyService: ChanspyApiService,
    private readonly http: HttpResponseService,
  ) {}

  @ApiOperation({ summary: 'Получение актуального пароля для суфлера' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: ChanspyPasswordResult,
  })
  @Get('password')
  async getChanspyPassword(@Req() req: Request, @Res() res: Response) {
    try {
      const password = await this.chanspyService.getPassword();
      return this.http.response(req, res, HttpStatus.OK, password);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Обновление пароля для суфлера' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
  })
  @ApiBody({ type: ChanspyDto })
  @Post('update-password')
  async updateChanspyPassword(
    @Req() req: Request,
    @Body() body: ChanspyDto,
    @Res() res: Response,
  ) {
    try {
      await this.chanspyService.updatePassword(body);
      return this.http.response(req, res, HttpStatus.OK);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({
    summary: 'Генерация нового пароля для суфлера',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: ChanspyPasswordResult,
  })
  @Get('generate-password')
  async generateChanspyPassword(@Req() req: Request, @Res() res: Response) {
    try {
      const password = await this.chanspyService.generatePassword();
      return this.http.response(req, res, HttpStatus.OK, password);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
