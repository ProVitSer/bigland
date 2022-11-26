import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform } from 'class-transformer';
import { CallType } from './interfaces/cdr.enum';

export type CdrDocument = Cdr & Document;

@Schema({ collection: 'cdr' })
export class Cdr {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    enum: CallType,
  })
  callType: CallType;

  @Prop({})
  exten: string;

  @Prop({})
  unicueid: string;

  @Prop({})
  extensionNumber: string;

  @Prop({})
  billsec: string;

  @Prop({})
  disposition: string;

  @Prop({})
  startCall: string;

  @Prop({})
  endCall: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  complete?: boolean;

  @Prop()
  stamp?: Date;

  @Prop()
  changed?: Date;
}

const CdrSchema = SchemaFactory.createForClass(Cdr);

CdrSchema.index({ unicueid: 'text' });

export { CdrSchema };
