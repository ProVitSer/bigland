import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OperatorFormatNumber, OperatorsName } from './interfaces/operators.enum';

@Schema({ collection: 'operators', versionKey: false })
export class Operators {
  @Prop({ enum: OperatorsName })
  name: OperatorsName;

  @Prop({ enum: OperatorFormatNumber })
  formatNumber: OperatorFormatNumber;

  @Prop()
  numbers: NumbersInfo[];

  @Prop({ type: Date, default: Date.now })
  stamp?: Date;

  @Prop({ type: Date, default: Date.now })
  changed?: Date;
}

@Schema()
export class NumbersInfo {
  @Prop()
  pbxTrunkNumber: number;

  @Prop()
  callerId: number;

  @Prop()
  outSuffix: string;

  @Prop()
  authUsername?: string;

  @Prop()
  isActive: boolean;
}

const OperatorsSchema = SchemaFactory.createForClass(Operators);
export type OperatorsDocument = Operators & Document;
export { OperatorsSchema };
