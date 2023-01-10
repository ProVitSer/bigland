import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'amocrm', versionKey: false })
export class Amocrm {
  @Prop()
  cdrId?: string;

  @Prop()
  statusCode: number;

  @Prop({ type: Object })
  amocrmResponse: any;

  @Prop({ type: Date, default: Date.now })
  stamp?: Date;

  @Prop({ type: Date, default: Date.now })
  changed?: Date;
}

export const AmocrmSchema = SchemaFactory.createForClass(Amocrm);

export type AmocrmDocument = Amocrm & Document;
