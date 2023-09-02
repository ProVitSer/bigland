import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthenticationGuard } from './guard/local-authentication.guard';
import { RequestWithUser } from './interfaces/auth.interfaces';
import { Request, Response } from 'express';
import { AuthUserService } from './services/auth-user.service';
import { AuthTokenService } from './services/auth-token.service';
import { JwtGuard } from './guard/jwt.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { RoleGuard } from './guard/role.guard';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('auth')
@UseGuards(RoleGuard([Role.Admin]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(
    private readonly authUserService: AuthUserService,
    private readonly authTokenService: AuthTokenService,
    private readonly http: HttpResponseService,
  ) {}

  @Post('register')
  @ApiExcludeEndpoint()
  async register(@Req() req: Request, @Res() res: Response, @Body() registrationData: RegisterDto) {
    try {
      const user = await this.authUserService.register(registrationData);
      return this.http.response(req, res, HttpStatus.OK, user);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, e?.httpStatus || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('apiToken')
  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @ApiExcludeEndpoint()
  async getApiToken(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      const { user } = req;
      const accessToken = await this.authTokenService.getApiToken(user.userId);
      return this.http.response(req, res, HttpStatus.OK, accessToken);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, e?.httpStatus || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
