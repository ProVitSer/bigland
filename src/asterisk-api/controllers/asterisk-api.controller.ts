import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Role } from '@app/users/interfaces/users.enum';
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AsteriskApiService } from '../services/asterisk-api.service';
import { AmdCallResultDTO } from '../dto/amd-call-result.dto';

@Controller('asterisk-api')
export class AsteriskApiApiController {
  constructor(private readonly http: HttpResponseService, private readonly asteriskApiService: AsteriskApiService) {}

  @UseFilters(HttpExceptionFilter)
  @UseGuards(RoleGuard(Role.User))
  @UseGuards(JwtGuard)
  @Get('status/:id')
  async getAstApiStatus(@Req() req: Request, @Param('id') asteriskApiId: string, @Res() res: Response) {
    try {
      const result = await this.asteriskApiService.getAsteriskApiStatus(asteriskApiId);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('amd/result')
  async setAmdCallResult(@Body() body: AmdCallResultDTO, @Res() res: Response) {
    this.asteriskApiService.setCheckNumberResult(body);
    return res.sendStatus(200);
  }
}
