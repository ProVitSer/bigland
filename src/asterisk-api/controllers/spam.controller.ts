import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { CheckOperatorNumbersDTO, CheckNumberDTO } from '../dto/check-spam.dto';
import { AsteriskApiService } from '../services/asterisk-api.service';

@UseFilters(HttpExceptionFilter)
@Controller('spam')
export class SpamApiController {
  constructor(private readonly http: HttpResponseService, private readonly asteriskApiService: AsteriskApiService) {}

  @UseGuards(RoleGuard([Role.User]))
  @UseGuards(JwtGuard)
  @Post('check-operator-numbers')
  async checkOperatorNumbers(@Req() req: Request, @Body() body: CheckOperatorNumbersDTO, @Res() res: Response) {
    try {
      const result = await this.asteriskApiService.checkOperatorNumbers(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(RoleGuard([Role.User]))
  @UseGuards(JwtGuard)
  @Post('check-number')
  async checkNumber(@Req() req: Request, @Body() body: CheckNumberDTO, @Res() res: Response) {
    try {
      const result = await this.asteriskApiService.checkNumber(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
