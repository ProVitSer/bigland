import { DataObject } from '@app/platform-types/common/interfaces';
import { TelegramService } from '@app/telegram/telegram.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { LogEventType } from './interfaces/log.interfaces';
import { Log, LogDocument } from './log.schems';

@Injectable()
export class LogService {
  private context = 'VPNP';

  constructor(
    @Inject('winston') private readonly logger: winston.Logger,
    private readonly Tg: TelegramService,
    @InjectModel(Log.name) private logModel: Model<LogDocument>,
  ) {}

  setContext(context: string) {
    this.context = context;
  }

  info(message: any, context?: string): void {
    this.logger.info(message, { context: `${this.context}.${context}` });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context: `${this.context}.${context}` });
  }

  error(message: string, context?: string): void {
    const logcontext = `${this.context}.${context}`;
    this.logger.error(message, { context: logcontext });
    this.Tg.tgAlert(message, logcontext);
  }

  public async saveLog(logEventType: LogEventType, messages: string | any, field?: DataObject): Promise<void> {
    if (Array.isArray(messages)) {
      Promise.all(
        messages.map(async (message: string | DataObject) => {
          const info = this.getLogInfo(message, field);
          await this.createLog(logEventType, info);
        }),
      );
    } else {
      const info = this.getLogInfo(messages, field);
      await this.createLog(logEventType, info);
    }
    return;
  }

  private getLogInfo(message: string | DataObject, field?: DataObject): DataObject {
    const data = typeof message === 'string' ? { message: message } : undefined;
    const userData = field ? field : {};

    return {
      ...data,
      ...(!!data ? {} : (message as DataObject)),
      ...userData,
    };
  }

  private async createLog(logEventType: LogEventType, info: DataObject): Promise<any> {
    const log = new this.logModel({
      logEventType,
      data: info,
    });
    return await log.save();
  }
}
