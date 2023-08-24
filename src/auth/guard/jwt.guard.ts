import { LogEventType } from '@app/log/interfaces/log.interfaces';
import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { INVALALID_TOKEN } from '../auth.constants';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (!!err || user == false) {
      throw new HttpException(
        {
          logEventType: LogEventType.token_fail,
          message: INVALALID_TOKEN,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
