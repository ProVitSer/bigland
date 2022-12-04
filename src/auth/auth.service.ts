import { UtilsService } from '@app/utils/utils.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
  GetApiTokenReponse,
  JwtPayload,
  RegisterResponse,
} from './types/interfaces';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { JwtTokenConfType } from './types/types';
import { UsersService } from '@app/users/users.service';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  public async getCookieWithJwtAccessToken(userId: string) {
    const token = await this.getToken(userId, JwtTokenConfType.access);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${
      this.configService.get(JwtTokenConfType.access).expiresIn
    }`;
  }

  public async getCookieWithJwtRefreshToken(userId: string) {
    const token = await this.getToken(userId, JwtTokenConfType.refresh);
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${
      this.configService.get(JwtTokenConfType.refresh).expiresIn
    }`;
    return {
      cookie,
      token,
    };
  }

  private async getToken(
    userId: string,
    jwtConfType: JwtTokenConfType,
    expiresIn?: string,
  ) {
    const payload: JwtPayload = { userId };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get(jwtConfType).tokenSecretKey,
      algorithm: this.configService.get(jwtConfType).algorithm,
      expiresIn: expiresIn || this.configService.get(jwtConfType).expiresIn,
    });
    return token;
  }

  public async getApiToken(
    userId: string,
    expiresIn: string,
  ): Promise<GetApiTokenReponse> {
    return {
      accessToken: await this.getToken(
        userId,
        JwtTokenConfType.access,
        expiresIn,
      ),
    };
  }

  public getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  public async removeRefreshToken(userId: string) {
    return await this.usersService.removeRefreshToken(userId);
  }

  public async varifyToken(token: string, jwtConfType: JwtTokenConfType) {
    try {
      return await this.jwtService.verify(
        token,
        this.configService.get(jwtConfType).tokenSecretKey,
      );
    } catch (e) {
      throw e;
    }
  }

  public decodeToken(req: Request): JwtPayload {
    try {
      const token = UtilsService.getToken(req);
      return this.jwtService.decode(token) as JwtPayload;
    } catch (e) {
      throw e;
    }
  }
}

@Injectable()
export class AuthUserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  public async register(
    registrationData: RegisterDto,
  ): Promise<RegisterResponse> {
    const { username, email, password } = registrationData;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const checkUser = await this.usersService.getByEmail(email.toLowerCase());
      if (checkUser)
        throw {
          message: `Пользователь с почтой  ${email} уже зарегистрирован`,
          httpStatus: HttpStatus.BAD_REQUEST,
        };
      await this.usersService.create({
        username,
        email: email.toLowerCase(),
        passHash: hashedPassword,
      });
      return {
        email,
        username,
      };
    } catch (e) {
      throw e;
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      if (user == null) {
        throw 'Пользователь с таким логином не найден';
      }
      await this.verifyPassword(plainTextPassword, user.passHash);
      user.passHash = undefined;
      return user;
    } catch (e) {
      throw e;
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw 'Предоставленные неверные учетные данные';
    }
  }
}
