import { ApiHttpExceptionFilter } from '@app/http/http-exception.filter';
import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ChanspyApiService } from '../services/chanspy-api.service';
import { Request, Response } from 'express';
import { ChanspyDto } from '../dto/chanspy.dto';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChanspyPasswordResult, UpdateChanspyPasswordResult } from '../interfaces/asterisk-api.interfaces';

@ApiTags('asterisk-api')
@Controller('asterisk-api/service/chanspy')
@UseGuards(RoleGuard([Role.Admin, Role.Api]))
@UseGuards(JwtGuard)
@UseFilters(ApiHttpExceptionFilter)
export class ChanspyApiController {
  constructor(private readonly chanspyService: ChanspyApiService, private readonly http: HttpResponseService) {}

  @Get('password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить актуальный пароль для прослушки chanSpy' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Актуальный пароль chanSpy',
    type: ChanspyPasswordResult,
  })
  async getChanspyPassword(@Req() req: Request, @Res() res: Response) {
    try {
      const password = await this.chanspyService.getPassword();
      return this.http.response(req, res, HttpStatus.OK, password);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('update-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить пароль для прослушки chanSpy' })
  @ApiBody({ type: ChanspyDto })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Обновленный пароль прослушки chanSpy',
    type: UpdateChanspyPasswordResult,
  })
  async updateChanspyPassword(@Req() req: Request, @Body() body: ChanspyDto, @Res() res: Response) {
    try {
      const password = await this.chanspyService.updatePassword(body);
      return this.http.response(req, res, HttpStatus.OK, password);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('renew-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Сгенерировать новый пароль для прослушки chanSpy' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Новый сгенерированный пароль',
    type: ChanspyPasswordResult,
  })
  async generateChanspyPassword(@Req() req: Request, @Res() res: Response) {
    try {
      const password = await this.chanspyService.renewPassword();
      return this.http.response(req, res, HttpStatus.OK, password);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
