import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Role } from '@app/users/interfaces/users.enum';
import { Controller, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AmocrmUsersService } from './amocrm-users.service';
import { Request, Response } from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('amocrm-users')
@UseGuards(RoleGuard([Role.Admin]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
export class AmocrmUsersController {
  constructor(private readonly http: HttpResponseService, private readonly amocrmUsersService: AmocrmUsersService) {}

  @Post('update')
  @ApiExcludeEndpoint()
  async updateLdsInfo(@Req() req: Request, @Res() res: Response) {
    try {
      await this.amocrmUsersService.updateAmocrmUsers();
      return this.http.response(req, res, HttpStatus.OK);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
