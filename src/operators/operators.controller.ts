import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Role } from '@app/users/interfaces/users.enum';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { OperatorsService } from './operators.service';
import { OperatorsNumberDTO } from './dto/add-operator-numbers.dto';
import { OperatorsName } from './interfaces/operators.enum';

@UseGuards(RoleGuard(Role.User))
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

  @Get(':operatorName')
  async getOperatorNumberInfo(@Req() req: Request, @Param('operatorName') operatorName: string, @Res() res: Response) {
    try {
      const result = await this.operatorsService.getOperatorNumberInfo(operatorName);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':operatorName/numbers')
  async addOperatorNumber(
    @Req() req: Request,
    @Param('operatorName') operatorName: string,
    @Body() body: OperatorsNumberDTO,
    @Res() res: Response,
  ) {
    try {
      const result = await this.operatorsService.updateOperatorNumber(operatorName as OperatorsName, body.numbers);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':operatorName')
  async deleteOperatorNumber(
    @Req() req: Request,
    @Param('operatorName') operatorName: string,
    @Body() body: OperatorsNumberDTO,
    @Res() res: Response,
  ) {
    try {
      const result = await this.operatorsService.deleteOperatorNumber(operatorName as OperatorsName, body.numbers);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
