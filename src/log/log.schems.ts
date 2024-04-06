import { DataObject } from '@app/platform-types/common/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LogEventType } from './interfaces/log.enum';

@Schema({
    collection: 'log',
    versionKey: false
})
export class Log {
    @Prop()
    logEventType: LogEventType;

    @Prop({
        type: Object
    })
    data: Record<string, unknown>;

    @Prop({
        type: Object
    })
    message?: string | DataObject;

    @Prop()
    user?: string;

    @Prop()
    description ? : string;

    @Prop({
        type: Date,
        default: Date.now
    })
    stamp?: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);

export type LogDocument = Log & Document;