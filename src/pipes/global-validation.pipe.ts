import { LogEventType } from '@app/log/interfaces/log.interfaces';
import { HttpException, HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { ValidationExceptionFactory } from './utils.pipe';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = ValidationExceptionFactory(errors);
        return new HttpException({ message: messages, logEventType: LogEventType.data_error }, HttpStatus.BAD_REQUEST);
      },
    });
  }
}
