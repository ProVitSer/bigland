import { UsersService } from '@app/users/users.service';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, GetApiTokenReponse, CookieJwtRefreshData } from '../interfaces/auth.interfaces';
import { Request } from 'express';
import { JwtTokenConfType } from '@app/config/interfaces/config.enum';
import { Users } from '@app/users/users.schema';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  public async getCookieWithJwtAccessToken(userId: string): Promise<string> {
    const token = await this.getToken(userId, JwtTokenConfType.access);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(JwtTokenConfType.access).expiresIn}`;
  }

  public async getCookieWithJwtRefreshToken(userId: string): Promise<CookieJwtRefreshData> {
    const token = await this.getToken(userId, JwtTokenConfType.refresh);
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(JwtTokenConfType.refresh).expiresIn}`;
    return {
      cookie,
      token,
    };
  }

  private async getToken(userId: string, jwtConfType: JwtTokenConfType, expiresIn?: string): Promise<string> {
    const payload: JwtPayload = { userId };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get(jwtConfType).tokenSecretKey,
      algorithm: this.configService.get(jwtConfType).algorithm,
      expiresIn: expiresIn || this.configService.get(jwtConfType).expiresIn,
    });
    return token;
  }

  public async getApiToken(userId: string, expiresIn = '1y'): Promise<GetApiTokenReponse> {
    return {
      accessToken: await this.getToken(userId, JwtTokenConfType.access, expiresIn),
    };
  }

  public getCookiesForLogOut(): string[] {
    return ['Authentication=; HttpOnly; Path=/; Max-Age=0', 'Refresh=; HttpOnly; Path=/; Max-Age=0'];
  }

  public async removeRefreshToken(userId: string): Promise<Users> {
    return await this.usersService.removeRefreshToken(userId);
  }

  public async verifyToken(token: string, jwtConfType: JwtTokenConfType) {
    try {
      return await this.jwtService.verify(token, this.configService.get(jwtConfType).tokenSecretKey);
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
