import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { FreepbxApiStatus } from './interfaces/freepbx-api.enum';

@Schema({ collection: 'freepbx', versionKey: false })
export class FreepbxApi {
  _id: string;

  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  apiId: string;

  @Prop()
  users: Users[];

  @Prop()
  stamp?: Date;

  @Prop()
  changed?: Date;
}

@Schema()
export class Users {
  @Prop()
  username: string;

  @Prop()
  number: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({
    type: String,
    enum: FreepbxApiStatus,
  })
  status?: string;

  @Prop()
  message?: string;

  @Prop()
  changed?: Date;
}

export const FreepbxApiSchema = SchemaFactory.createForClass(FreepbxApi);

export type FreepbxApiDocument = FreepbxApi & Document;
