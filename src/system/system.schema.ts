import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'system', versionKey: false })
export class System {
  _id: string;

  @Prop()
  chanSpyPassword: string;

  @Prop()
  gsmGateway: GsmGateway[];

  @Prop()
  numbersInfo: NumberInfo[];

  @Prop()
  blackListNumbers: string[];

  @Prop()
  freepbxAvailableExtension: string[];
}

@Schema()
export class GsmGateway {
  @Prop()
  port: string;

  @Prop()
  number: string;

  @Prop()
  balance: string;
}

@Schema()
export class CreateLeadData {
  @Prop()
  description: string;

  @Prop()
  pipelineId: string;

  @Prop()
  statusId: string;

  @Prop()
  customFieldsValues: [{ [key: string]: any }];
}

@Schema()
export class NumberInfo {
  @Prop()
  trunkNumber: string;

  @Prop()
  originNumber: string;

  @Prop()
  createLead: CreateLeadData;
}

export const SystemSchema = SchemaFactory.createForClass(System);

export type SystemDocument = System & Document;
