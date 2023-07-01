import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { CreateUsersDto } from './dto/create-users.dto';
import { FreepbxUsersApiService } from './freepbx-api-users.service';
import { Request, Response } from 'express';
import { Role } from '@app/users/interfaces/users.enum';

@UseGuards(RoleGuard([Role.Admin]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
@Controller('freepbx-api')
export class FreepbxApiController {
  constructor(private readonly http: HttpResponseService, private readonly freepbxUsersApi: FreepbxUsersApiService) {}

  @Post('users')
  async createUsers(@Req() req: Request, @Res() res: Response, @Body() body: CreateUsersDto) {
    try {
      const result = await this.freepbxUsersApi.createUsers(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
