import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    collection: 'lds',
    versionKey: false
})
export class Lds {
    @Prop()
    id: number;

    @Prop()
    sip_id: number | null;

    @Prop()
    is_active: boolean;

    @Prop()
    amo: Amo[] | [];

    @Prop()
    post: Post[] | [];

    @Prop({
        type: Date,
        default: Date.now
    })
    stamp?: Date;

    @Prop({
        type: Date,
        default: Date.now
    })
    changed?: Date;
}

@Schema()
export class Amo {
    @Prop()
    user_id: number;

    @Prop()
    amo_account_id: number;

    @Prop()
    amo_id: number;
}

@Schema()
export class Post {
    @Prop()
    id: number;

    @Prop()
    title: string;

    @Prop()
    description: string | null;

    @Prop()
    plan_daily_calls_air: string;

    @Prop()
    plan_daily_calls_amount: number;
}

const LdsSchema = SchemaFactory.createForClass(Lds);
export type LdsDocument = Lds & Document;
export { LdsSchema };