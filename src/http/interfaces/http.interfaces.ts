import { LogEventType } from '@app/log/interfaces/log.interfaces';
import { HttpStatus } from '@nestjs/common';

export interface DataObject {
  [key: string]: any;
}

export class IHttpResponse {
  statusCode: HttpStatus;
  message?: string | string[] | any;
  result: boolean;
  errors?: string | DataObject;
  data?: string | DataObject;
  path: string;
  timestamp: string;
  createdBy: string;
}

// export class IHttpErrorResponse extends IHttpResponse {
//     errors?: string | DataObject;
// }

export interface HttpExeptionInfo {
  logEventType: LogEventType;
  message?: string;
  error?: DataObject;
}

export enum SwaggerTypes {
  object = 'object',
  string = 'string',
}

export enum SwaggerApiBadResponse {
  ApiBadRequestResponse = 'ApiBadRequestResponse',
  ApiInternalServerErrorResponse = 'ApiInternalServerErrorResponse',
}

export const SwaggerHttpErrorResponseMap: {
  [key in SwaggerApiBadResponse]: DataObject;
} = {
  [SwaggerApiBadResponse.ApiBadRequestResponse]: {
    schema: {
      properties: {
        error: {
          type: SwaggerTypes.object,
          properties: {
            error: { type: SwaggerTypes.object },
            message: { type: SwaggerTypes.object },
          },
        },
      },
    },
  },
  [SwaggerApiBadResponse.ApiInternalServerErrorResponse]: {
    schema: {
      properties: {
        error: { type: 'string' },
      },
    },
  },
};
