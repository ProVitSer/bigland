import { AsteriskCdr } from '@app/asterisk-cdr/asterisk-cdr.entity';
import { DataObject } from '@app/platform-types/common/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

@Schema({ collection: 'amocrm', versionKey: false })
export class Amocrm {
  @Prop({ type: Object })
  cdrId?: ObjectId | undefined;

  @Prop()
  statusCode: number;

  @Prop({ type: Object })
  amocrmResponseData: DataObject;

  @Prop({ type: Object })
  amocrmRequestData: DataObject;

  @Prop({ type: Object })
  cdrData?: AsteriskCdr;

  @Prop({ type: Date, default: Date.now })
  stamp?: Date;

  @Prop({ type: Date, default: Date.now })
  changed?: Date;
}

export const AmocrmSchema = SchemaFactory.createForClass(Amocrm);

export type AmocrmDocument = Amocrm & Document;
