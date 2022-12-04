import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LogEventType } from './interfaces/log.interfaces';

@Schema({ collection: 'log', versionKey: false })
export class Log {
  @Prop()
  logEventType: LogEventType;

  @Prop({ type: Object })
  data: Record<string, unknown>;

  @Prop({ type: Object })
  message?: string | { [key: string]: any };

  @Prop()
  user?: string;

  @Prop()
  description?: string;

  // @Prop()
  // source?: CollectionType;

  @Prop()
  stamp?: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);

export type LogDocument = Log & Document;
