import { Inject, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LogService {
  private context = 'VPNP';

  constructor(@Inject('winston') private readonly logger: winston.Logger) {}

  setContext(context: string) {
    this.context = context;
  }

  info(message: any, context?: any): void {
    this.logger.info(message, { context: `${this.context}.${context}` });
  }

  debug(message: string, context?: any): void {
    this.logger.debug(message, { context: `${this.context}.${context}` });
  }

  error(message: string, context?: any): void {
    this.logger.error(message, { context: `${this.context}.${context}` });
  }
}
