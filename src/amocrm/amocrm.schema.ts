import { DataObject } from '@app/platform-types/common/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    collection: 'amocrm',
    versionKey: false
})
export class Amocrm {
    @Prop()
    statusCode: number;

    @Prop({
        type: Object
    })
    request: DataObject;

    @Prop({
        type: Object
    })
    response: DataObject;

    @Prop({
        type: Date,
        default: Date.now
    })
    stamp ? : Date;
}

export const AmocrmSchema = SchemaFactory.createForClass(Amocrm);

export type AmocrmDocument = Amocrm & Document;