import { LogEventType } from '@app/log/interfaces/log.interfaces';
import { Role } from '@app/users/interfaces/users.enum';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  mixin,
  Type,
} from '@nestjs/common';
import { RequestWithUser } from '../types/interfaces';

export const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;
      if (user?.roles.includes(role)) {
        return true;
      } else {
        throw new HttpException(
          {
            logEventType: LogEventType.auth_fail,
            message: 'Пользователю ограничны доступы на данный роут',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  return mixin(RoleGuardMixin);
};
