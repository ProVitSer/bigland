import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpResponseService } from './http-response';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { LogService } from '@app/log/log.service';

@Injectable()
@Catch(HttpException)
export class ApiHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly http: HttpResponseService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    return this.http.exeption(request, response, exception);
  }
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly log: LogService, applicationRef?: HttpAdapterHost) {
    super(applicationRef.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.getResponse() : exception;

    this.log.error(
      {
        timestamp: new Date().toISOString(),
        path: request.url,
        error: message,
      },
      AllExceptionsFilter.name,
    );

    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}
