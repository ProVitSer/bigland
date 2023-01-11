import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AuthTokenService, AuthUserService } from './auth.service';
import { LogInDto } from './dto/logIn.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthenticationGuard } from './guard/local-authentication.guard';
import { GetApiTokenReponse, RegisterResponse, RequestWithUser } from './interfaces/auth.interfaces';
import { Request, Response } from 'express';
import { ApiBadRequestResponse, ApiBody, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerApiBadResponse, SwaggerHttpErrorResponseMap } from '@app/http/interfaces/http.interfaces';

@ApiTags('auth')
@ApiBadRequestResponse(SwaggerHttpErrorResponseMap[SwaggerApiBadResponse.ApiBadRequestResponse])
@ApiInternalServerErrorResponse(SwaggerHttpErrorResponseMap[SwaggerApiBadResponse.ApiInternalServerErrorResponse])
@UseFilters(HttpExceptionFilter)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authUserService: AuthUserService,
    private readonly authTokenService: AuthTokenService,
    private readonly http: HttpResponseService,
  ) {}

  @ApiOperation({
    summary: 'Регистрация пользователя для взаимодействия с API',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: RegisterResponse,
  })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  async register(@Req() req: Request, @Res() res: Response, @Body() registrationData: RegisterDto) {
    try {
      const user = await this.authUserService.register(registrationData);
      return this.http.response(req, res, HttpStatus.OK, user);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, e?.httpStatus || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Получение токена для взаимодействия с API' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Успешный ответ',
    type: GetApiTokenReponse,
  })
  @ApiBody({ type: LogInDto })
  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('apiToken')
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
