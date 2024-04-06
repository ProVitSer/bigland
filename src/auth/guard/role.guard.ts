import { LogEventType } from '@app/log/interfaces/log.enum';
import { Role } from '@app/users/interfaces/users.enum';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, mixin, Type } from '@nestjs/common';
import { LIMITED_ACCESS } from '../auth.constants';
import { RequestWithUser } from '../interfaces/auth.interfaces';

export const RoleGuard = (roles: Role[]): Type<CanActivate> => {
    class RoleGuardMixin implements CanActivate {
        canActivate(context: ExecutionContext) {

            const { user } = context.switchToHttp().getRequest<RequestWithUser> ();

            if (user?.roles.some((role) => roles.includes(role))) {
                return true;
            } else {
                throw new HttpException({
                        logEventType: LogEventType.auth_fail,
                        message: LIMITED_ACCESS,
                    },
                    HttpStatus.UNAUTHORIZED,
                );
            };
            
        }
    }

    return mixin(RoleGuardMixin);
};