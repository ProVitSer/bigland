import { ApplicationApiActionStatus } from '@app/bigland/interfaces/bigland.enum';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CheckSpamStatus, SpamType } from './interfaces/spam-api.enum';

@Schema({ collection: 'spam', versionKey: false })
export class Spam {
  @Prop({ unique: true })
  applicationId: string;

  @Prop({
    type: String,
    enum: ApplicationApiActionStatus,
    default: ApplicationApiActionStatus.inProgress,
  })
  status: ApplicationApiActionStatus;

  @Prop({
    type: String,
    enum: SpamType,
  })
  spamType: SpamType;

  @Prop()
  error?: string;

  @Prop({})
  resultSpamCheck: SpamCheckResult[];

  @Prop({ type: Date, default: Date.now })
  checkDate: Date;
}

@Schema()
export class SpamCheckResult {
  @Prop()
  operator: OperatorsName;

  @Prop()
  numbers: SpamCheckNumbersInfo[];
}

@Schema()
export class SpamCheckNumbersInfo {
  @Prop()
  number: string;

  @Prop()
  status?: CheckSpamStatus;
}

export const SpamSchema = SchemaFactory.createForClass(Spam);

export type SpamDocument = Spam & Document;
