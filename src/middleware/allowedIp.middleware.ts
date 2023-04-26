import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import * as requestIp from 'request-ip';
import { ConfigService } from '@nestjs/config';
import { LogEventType } from '@app/log/interfaces/log.interfaces';
import { LogService } from '@app/log/log.service';

@Injectable()
export class AllowedIpMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService, private readonly log: LogService) {}

  use(request: Request, response: Response, next: NextFunction): any {
    try {
      const ip = requestIp.getClientIp(request);
      const allowedIp = this.configService.get('security.ipWhiteList');
      if (!!allowedIp && !allowedIp.includes(ip)) {
        const err = {
          result: false,
          logEventType: LogEventType.ip_address_blocking,
          message: `Запросы с IP ${ip} не допустимы`,
          httpStatus: HttpStatus.FORBIDDEN,
        };
        this.log.saveLog(err.logEventType, err.message);
        throw err;
      }
      next();
    } catch (e) {
      next(new HttpException({ result: e.result, message: e.message }, e.httpStatus));
    }
  }
}
