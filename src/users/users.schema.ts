import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from './interfaces/users.enum';

@Schema({ collection: 'users', versionKey: false })
export class Users {
  _id: string;

  @Prop({ unique: true })
  userId: string;

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

  @Prop({ type: Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop()
  updateAt?: Date;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

export type UsersDocument = Users & Document;
