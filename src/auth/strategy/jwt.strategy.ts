import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/auth.interfaces';
import { AuthUserService } from '../services/auth-user.service';
import { JwtTokenConfType } from '@app/config/interfaces/config.enum';
import { Users } from '@app/users/users.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService, private readonly authUserService: AuthUserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get(JwtTokenConfType.access).tokenSecretKey,
        });
    }

    async validate(payload: TokenPayload): Promise<Users> {
        try {

            return await this.authUserService.validateUser(payload.userId);

        } catch (e) {

            throw e;
            
        }
    }
}