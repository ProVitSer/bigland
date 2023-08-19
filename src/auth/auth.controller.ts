import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AuthTokenService, AuthUserService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthenticationGuard } from './guard/local-authentication.guard';
import { RequestWithUser } from './interfaces/auth.interfaces';
import { Request, Response } from 'express';

@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(
    private readonly authUserService: AuthUserService,
    private readonly authTokenService: AuthTokenService,
    private readonly http: HttpResponseService,
  ) {}

  @Post('register')
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
  async getApiToken(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      const { user } = req;
      const accessToken = await this.authTokenService.getApiToken(user._id, '1y');
      return this.http.response(req, res, HttpStatus.OK, accessToken);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, e?.httpStatus || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
