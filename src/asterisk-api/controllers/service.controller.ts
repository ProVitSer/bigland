import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { DNDDto } from '../dto/dnd.dto';
import { Request, Response } from 'express';
import { ServiceCodeApiService } from '../services/service-code-api.service';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';

@UseGuards(RoleGuard([Role.Admin]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
@Controller('service')
export class ServiceCodeApiController {
  constructor(private readonly serviceCode: ServiceCodeApiService, private readonly http: HttpResponseService) {}

  @Post('dnd')
  async setDnd(@Req() req: Request, @Body() body: DNDDto, @Res() res: Response) {
    try {
      const resultSet = await this.serviceCode.setDndStatus(body);
      return this.http.response(req, res, HttpStatus.OK, [resultSet]);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
