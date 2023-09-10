import { DataObject } from '@app/platform-types/common/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'system', versionKey: false })
export class System {
  _id: string;

  @Prop()
  chanSpyPassword: string;

  @Prop()
  numbersInfo: NumberInfo[];

  @Prop()
  blackListNumbers: string[];

  @Prop()
  freepbxAvailableExtension: string[];
}

@Schema()
export class CreateLeadData {
  @Prop()
  description: string;

  @Prop()
  pipelineId?: string;

  @Prop()
  statusId: string;

  @Prop()
  customFieldsValues: DataObject[];
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
