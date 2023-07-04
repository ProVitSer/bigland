import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from './interfaces/users.enum';

@Schema({ collection: 'users', versionKey: false })
export class Users {
  _id: string;

  @Prop()
  email: string;

  @Prop()
  username: string;

  @Prop()
  passHash: string;

  @Prop()
  currentHashedRefreshToken?: string;

  @Prop({
    type: [String],
    enum: Role,
    default: Role.User,
  })
  roles: Role[];

  @Prop()
  stamp: Date;

  @Prop()
  deleted?: boolean;

  @Prop()
  changed?: Date;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

export type UsersDocument = Users & Document;
