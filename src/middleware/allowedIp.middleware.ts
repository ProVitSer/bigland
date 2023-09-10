import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogEventType } from '@app/log/interfaces/log.interfaces';
import { LogService } from '@app/log/log.service';
import { UtilsService } from '@app/utils/utils.service';
import { SecurityEnvironmentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class AllowedIpMiddleware implements NestMiddleware {
  private securityConfig = this.configService.get<SecurityEnvironmentVariables>('security');

  constructor(private readonly configService: ConfigService, private readonly log: LogService) {}

  use(request: Request, response: Response, next: NextFunction): any {
    try {
      const clientIp = UtilsService.getClientIp(request);
      const allowedIp = this.securityConfig.ipWhiteList;
      if (!!allowedIp && !allowedIp.includes(clientIp)) {
        const err = {
          result: false,
          logEventType: LogEventType.ip_address_blocking,
          message: `Запросы с IP ${clientIp} не допустимы`,
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
