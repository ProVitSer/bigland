import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Role } from '@app/users/interfaces/users.enum';
import { Body, Controller, Get, HttpException, HttpStatus, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { OperatorsService } from './operators.service';

@UseGuards(RoleGuard(Role.Admin))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
@Controller('operators')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService, private readonly http: HttpResponseService) {}

  @Get('')
  async getOperators(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.operatorsService.getOperators();
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
