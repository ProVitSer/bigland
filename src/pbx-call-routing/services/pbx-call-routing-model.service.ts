import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PbxCallRouting, PbxCallRoutingDocument } from '../pbx-call-routing.schema';

@Injectable()
export class PbxCallRoutingModelService {
  constructor(@InjectModel(PbxCallRouting.name) private operatorsModel: Model<PbxCallRoutingDocument>) {}

  public async getRoutingInfo(localExtension: string): Promise<PbxCallRouting> {
    return await this.operatorsModel.findOne({ localExtension });
  }
}
