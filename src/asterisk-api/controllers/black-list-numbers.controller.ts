import { ApiHttpExceptionFilter } from '@app/http/http-exception.filter';
import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BlackListNumbersService } from '../services';
import { BlackListNumbersDTO } from '../dto/black-list-numbers.dto';
import { ModifyBlackListNumbersResult } from '../interfaces/asterisk-api.interfaces';

@ApiTags('asterisk-api')
@Controller('asterisk-api/service/black-list-numbers')
@UseGuards(RoleGuard([Role.Admin, Role.Api]))
@UseGuards(JwtGuard)
@UseFilters(ApiHttpExceptionFilter)
export class BlackListyApiController {
  constructor(private readonly blackListNumbersService: BlackListNumbersService, private readonly http: HttpResponseService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить актуальный список номеров которые находятся в черном списке' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Актуальный список номеров в черном списке',
    type: [String],
  })
  async getBlackListNumbers(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.blackListNumbersService.getBlackListNumbers();
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('add')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить номера в черный список' })
  @ApiBody({ type: BlackListNumbersDTO })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Номера добавленные в черный список',
    type: ModifyBlackListNumbersResult,
  })
  async addBlackListNumbers(@Req() req: Request, @Body() body: BlackListNumbersDTO, @Res() res: Response) {
    try {
      const result = await this.blackListNumbersService.addNumbersToBlackList(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить номера из черного списка' })
  @ApiBody({ type: BlackListNumbersDTO })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Номера удаленный из черного списка',
    type: ModifyBlackListNumbersResult,
  })
  async deleteBlackListNumbers(@Req() req: Request, @Body() body: BlackListNumbersDTO, @Res() res: Response) {
    try {
      const result = await this.blackListNumbersService.deleteNumbersToBlackList(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
