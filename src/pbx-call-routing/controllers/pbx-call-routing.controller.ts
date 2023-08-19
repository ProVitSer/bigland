import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Role } from '@app/users/interfaces/users.enum';
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { PbxGroup } from '../interfaces/pbx-call-routing.enum';

@Controller('pbx-call-routing')
@UseGuards(RoleGuard([Role.Admin]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
export class PbxCallRoutingController {
  constructor(private readonly http: HttpResponseService) {}

  @Get('group-route/:groupName')
  async getGroupRoute(@Req() req: Request, @Param('groupName') groupName: PbxGroup, @Res() res: Response) {
    try {
      return this.http.response(req, res, HttpStatus.OK, {});
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('extension-route/:extension')
  async getExtensionRoute(@Req() req: Request, @Param('extension') extension: any, @Res() res: Response) {
    try {
      return this.http.response(req, res, HttpStatus.OK, {});
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('update/group')
  async updateGroupRoute(@Req() req: Request, @Body() body: any, @Res() res: Response) {
    try {
      return this.http.response(req, res, HttpStatus.OK, {});
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('update/extension')
  async updateExtensionRoute(@Req() req: Request, @Body() body: any, @Res() res: Response) {
    try {
      return this.http.response(req, res, HttpStatus.OK, {});
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('add')
  async addExtensionRoute(@Req() req: Request, @Body() body: any, @Res() res: Response) {
    try {
      return this.http.response(req, res, HttpStatus.OK, {});
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
