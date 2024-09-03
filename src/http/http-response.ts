import { LogEventType } from '@app/log/interfaces/log.enum';
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

        const response = this.getResponseStruct(status, true, data);

        return res.status(response.statusCode).json(response);

    }

    public exeption(req: Request, res: Response, exception: HttpException): Response {

        this.path = req.url;

        const errorBody = exception.getResponse() as DataObject;

        const response = this.getResponseStruct(exception.getStatus(), false, '', errorBody?.message);

        return res.status(response.statusCode).json(response);

    }

    private getResponseStruct(status: number, result: boolean, data?: string | DataObject, error?: object): HttpResponse {

        const dataResponse = !!data ? { data } : {};

        const errorResponse = !!error ? { error } : {};

        const jsonResponse: HttpResponse = {
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

    private logData(logEventType: LogEventType, jsonResponse: HttpResponse): HttpResponse {

        this.log.info(jsonResponse, HttpResponseService.name);

        this.log.saveLog(logEventType, jsonResponse);

        return jsonResponse;

    }
}