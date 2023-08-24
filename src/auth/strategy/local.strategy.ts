import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Users } from '@app/users/users.schema';
import { AuthUserService } from '../services/auth-user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authUserService: AuthUserService) {
    super({
      usernameField: 'email',
    });
  }
  async validate(email: string, password: string): Promise<Users> {
    return this.authUserService.getAuthenticatedUser(email, password);
  }
}
