import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    collection: 'amocrm-users',
    versionKey: false
})
export class AmocrmUsers {
    @Prop()
    amocrmId: number;

    @Prop()
    localExtension: number;

    @Prop({
        type: Date,
        default: Date.now
    })
    stamp ? : Date;

    @Prop({
        type: Date,
        default: Date.now
    })
    changed ? : Date;
}

export const AmocrmUsersSchema = SchemaFactory.createForClass(AmocrmUsers);

export type AmocrmUsersDocument = AmocrmUsers & Document;