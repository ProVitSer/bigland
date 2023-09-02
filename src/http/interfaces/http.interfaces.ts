import { LogEventType } from '@app/log/interfaces/log.interfaces';
import { DataObject } from '@app/platform-types/common/interfaces';
import { HttpStatus } from '@nestjs/common';

export class HttpResponse {
  statusCode?: HttpStatus;
  message?: string | string[] | any;
  result?: boolean;
  errors?: string | DataObject;
  data?: string | DataObject;
  path?: string;
  timestamp?: string;
  createdBy?: string;
}

export interface HttpExeptionInfo {
  logEventType: LogEventType;
  message?: string;
  error?: DataObject;
}
