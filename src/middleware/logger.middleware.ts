import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { LogService } from '@app/log/log.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private requestErrorMessage = null;
  private readonly requestStart = Date.now();

  constructor(private readonly log: LogService) {}

  use(request: Request, response: Response, next: NextFunction): void {
    request.on('error', (error) => {
      this.getError(error);
    });
    response.on('error', (error) => {
      this.getError(error);
    });
    response.on('finish', () => {
      this.logMiddleware(request, response, this.requestErrorMessage);
    });

    next();
  }

  private getError(error: any) {
    this.requestErrorMessage = error.message;
  }

  private logMiddleware(request: Request, response: Response, errorMessage: string) {
    const { httpVersion, method, socket, url } = request;
    const { remoteAddress, remoteFamily } = socket;
    const { statusCode, statusMessage } = response;
    this.log.info(
      {
        timestamp: Date.now(),
        processingTime: Date.now() - this.requestStart,
        body: request.body,
        errorMessage,
        httpVersion,
        method,
        remoteAddress,
        remoteFamily,
        url,
        response: {
          statusCode,
          statusMessage,
        },
      },
      LoggerMiddleware.name,
    );
  }
}
