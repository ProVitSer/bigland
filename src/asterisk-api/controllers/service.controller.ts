import { ApiHttpExceptionFilter } from '@app/http/http-exception.filter';
import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { DNDDto } from '../dto/dnd.dto';
import { Request, Response } from 'express';
import { ServiceCodeApiService } from '../services/service-code-api.service';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SetDNDStatusResult } from '@app/asterisk/ami/interfaces/ami.interfaces';
import { ExtensionsStateService } from '../services/extensions-state.service';
import { ActualExtensionsState } from '../interfaces/asterisk-api.interfaces';

@ApiTags('asterisk-api')
@Controller('asterisk-api/service')
@UseGuards(RoleGuard([Role.Admin, Role.Api]))
@UseGuards(JwtGuard)
@UseFilters(ApiHttpExceptionFilter)
export class ServiceCodeApiController {
  constructor(
    private readonly serviceCode: ServiceCodeApiService,
    private readonly http: HttpResponseService,
    private readonly extensionsStateService: ExtensionsStateService,
  ) {}

  @Post('dnd')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменение статуса dnd добавочных номеров' })
  @ApiBody({ type: DNDDto })
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
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('extensions-state')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить актуальное состояние внутренних номеров' })
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
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
