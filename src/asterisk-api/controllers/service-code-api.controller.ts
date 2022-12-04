import { HttpExceptionFilter } from '@app/http/http-exception.filter';
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
import { DNDDto } from '../dto/dnd.dto';
import { Request, Response } from 'express';
import { ServiceCodeApiService } from '../services/service-code-api.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import {
  SwaggerApiBadResponse,
  SwaggerHttpErrorResponseMap,
} from '@app/http/interfaces/http.interfaces';
import { SetDNDStatusResult } from '@app/asterisk/interfaces/asterisk.interfaces';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';

@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
@ApiTags('service')
@ApiBadRequestResponse(
  SwaggerHttpErrorResponseMap[SwaggerApiBadResponse.ApiBadRequestResponse],
)
@ApiInternalServerErrorResponse(
  SwaggerHttpErrorResponseMap[
    SwaggerApiBadResponse.ApiInternalServerErrorResponse
  ],
)
@UseGuards(RoleGuard(Role.Admin))
@ApiBearerAuth('JWT-auth')
@Controller('service')
export class ServiceCodeApiController {
  constructor(
    private readonly serviceCode: ServiceCodeApiService,
    private readonly http: HttpResponseService,
  ) {}

  @ApiOperation({ summary: 'Изменение статуса DND у добавочного номера' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: SetDNDStatusResult,
  })
  @ApiBody({ type: DNDDto })
  @Post('dnd')
  async setDnd(
    @Req() req: Request,
    @Body() body: DNDDto,
    @Res() res: Response,
  ) {
    try {
      const resultSet = await this.serviceCode.setDndStatus(body);
      return this.http.response(req, res, HttpStatus.OK, [resultSet]);
    } catch (e) {
      throw new HttpException(
        { message: e?.message || e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
