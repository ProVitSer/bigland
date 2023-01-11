import { UsersService } from '@app/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtTokenConfType } from '../interfaces/auth.enum';
import { TokenPayload } from '../interfaces/auth.interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get(JwtTokenConfType.access).tokenSecretKey,
    });
  }

  async validate(payload: TokenPayload) {
    return this.usersService.getById(payload.userId);
  }
}
