import { LogEventType } from '@app/log/interfaces/log.interfaces';
import { LogService } from '@app/log/log.service';
import { DataObject } from '@app/platform-types/common/interfaces';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpResponse } from './interfaces/http.interfaces';

@Injectable()
export class HttpResponseService {
  private path: string;
  constructor(private readonly log: LogService) {}

  public response(req: Request, res: Response, status: HttpStatus, data?: any): Response {
    this.path = req.url;
    this.logData(LogEventType.api_success, { data });
    return res.status(status).json({ data });
  }

  public exeption(req: Request, res: Response, exception: HttpException): Response {
    this.path = req.url;
    const errorBody = exception.getResponse() as DataObject;
    this.logData(LogEventType.api_error, { error: errorBody?.message });
    return res.status(exception.getStatus()).json({ error: errorBody?.message });
  }

  private logData(logEventType: LogEventType, jsonResponse: DataObject): HttpResponse {
    this.log.info(jsonResponse, HttpResponseService.name);
    this.log.saveLog(logEventType, jsonResponse);
    return jsonResponse;
  }
}
