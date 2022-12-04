import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'amocrm-users', versionKey: false })
export class AmocrmUsers {
  @Prop()
  amocrmId: number;

  @Prop()
  localExtension: number;
}

export const AmocrmUsersSchema = SchemaFactory.createForClass(AmocrmUsers);

export type AmocrmUsersDocument = AmocrmUsers & Document;
