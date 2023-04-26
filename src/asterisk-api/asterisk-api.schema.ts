import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AsteriskApiActionStatus } from './interfaces/asterisk-api.enum';

@Schema({ collection: 'asterisk-api', versionKey: false })
export class AsterikkApi extends Document {
  @Prop({ enum: AsteriskApiActionStatus, default: AsteriskApiActionStatus.inProgress })
  status: AsteriskApiActionStatus;

  @Prop({ type: Object })
  requestData: { [key: string]: any };

  @Prop({ type: Object })
  resultData: { [key: string]: any };
}

const AsterikkApiSchema = SchemaFactory.createForClass(AsterikkApi);
export type AsterikkApiDocument = AsterikkApi & Document;
export { AsterikkApiSchema };
