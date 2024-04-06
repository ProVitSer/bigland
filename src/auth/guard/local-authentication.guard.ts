import { LogEventType } from '@app/log/interfaces/log.enum';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthenticationGuard extends AuthGuard('local') {

    handleRequest(err: any, user: any) {

        if (!!err || user === false) {

            throw new HttpException({
                    logEventType: LogEventType.auth_fail,
                    message: err,
                },
                HttpStatus.UNAUTHORIZED,
            );
            
        };

        return user;
    }
}