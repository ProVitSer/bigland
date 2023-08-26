import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtTokenConfType } from '../interfaces/auth.enum';
import { TokenPayload } from '../interfaces/auth.interfaces';
import { AuthUserService } from '../services/auth-user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private readonly authUserService: AuthUserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(JwtTokenConfType.access).tokenSecretKey,
    });
  }

  async validate(payload: TokenPayload) {
    try {
      return await this.authUserService.validateUser(payload.userId);
    } catch (e) {
      throw e;
    }
  }
}
