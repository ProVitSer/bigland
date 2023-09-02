import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Role } from '@app/users/interfaces/users.enum';
import { Controller, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { LdsService } from './lds.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('lds')
@UseGuards(RoleGuard([Role.Admin]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
export class LdsController {
  constructor(private readonly http: HttpResponseService, private readonly ldsService: LdsService) {}

  @Post('update')
  @ApiExcludeEndpoint()
  async updateLdsInfo(@Req() req: Request, @Res() res: Response) {
    try {
      await this.ldsService.updateLds();
      return this.http.response(req, res, HttpStatus.OK);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
