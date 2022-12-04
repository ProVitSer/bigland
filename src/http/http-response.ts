import { LogEventType } from '@app/log/interfaces/log.interfaces';
import { LogService } from '@app/log/log.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { DataObject, IHttpResponse } from './interfaces/http.interfaces';

@Injectable()
export class HttpResponseService {
  private path: string;
  constructor(private readonly log: LogService) {}

  public response(
    req: Request,
    res: Response,
    status: HttpStatus,
    data?: any,
  ): Response {
    this.path = req.url;
    const response = this.getResponseStruct(status, true, data);
    this.logData(LogEventType.api_success, response);
    return res.status(response.statusCode).json(response);
  }

  public exeption(
    req: Request,
    res: Response,
    exception: HttpException,
  ): Response {
    this.path = req.url;
    const errorBody = exception.getResponse() as { [key: string]: any };
    const response = this.getResponseStruct(
      exception.getStatus(),
      false,
      '',
      errorBody?.message,
    );
    this.logData(LogEventType.api_error, response);
    return res.status(response.statusCode).json(response);
  }

  private getResponseStruct(
    status: number,
    result: boolean,
    data?: string | DataObject,
    error?: object,
  ): IHttpResponse {
    const dataResponse = !!data ? { data } : {};
    const errorResponse = !!error ? { error } : {};

    const jsonResponse: IHttpResponse = {
      statusCode: status,
      result,
      ...dataResponse,
      ...errorResponse,
      path: this.path,
      timestamp: new Date().toISOString(),
      createdBy: 'VPNP',
    };

    return jsonResponse;
  }

  private logData(
    logEventType: LogEventType,
    jsonResponse: IHttpResponse,
  ): IHttpResponse {
    this.log.info(jsonResponse, HttpResponseService.name);
    this.log.saveLog(logEventType, jsonResponse);
    return jsonResponse;
  }
}
