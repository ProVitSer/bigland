import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PbxGroup, PbxRoutingStrategy } from './interfaces/pbx-call-routing.enum';

@Schema({
    collection: 'pbx-call-routing',
    versionKey: false
})
export class PbxCallRouting {
    @Prop({
        unique: true
    })
    localExtension: string;

    @Prop({
        type: String,
        enum: PbxGroup,
        default: PbxGroup.manager,
    })
    group: PbxGroup;

    @Prop({
        type: String,
        enum: PbxRoutingStrategy,
        default: PbxRoutingStrategy.roundRobin,
    })
    routingStrategy: PbxRoutingStrategy;

    @Prop()
    operatorId: string;

    @Prop()
    staticCID ? : string;

    @Prop({
        type: Date,
        default: Date.now
    })
    createAt?: Date;
}

export const PbxCallRoutingSchema = SchemaFactory.createForClass(PbxCallRouting);

export type PbxCallRoutingDocument = PbxCallRouting & Document;