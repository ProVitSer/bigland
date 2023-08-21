import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PbxCallRouting, PbxCallRoutingDocument } from '../pbx-call-routing.schema';
import { PbxGroup } from '../interfaces/pbx-call-routing.enum';

@Injectable()
export class PbxCallRoutingModelService {
  constructor(@InjectModel(PbxCallRouting.name) private operatorsModel: Model<PbxCallRoutingDocument>) {}

  public async getPbxCallRouting(filter: { [key: string]: any }, projection?: { [key: string]: any }): Promise<PbxCallRouting> {
    return await this.operatorsModel.findOne({ ...filter }, projection);
  }

  public async updateOperatorIdForGroup(newOperatorId: string, groupName: PbxGroup): Promise<void> {
    await this.operatorsModel.updateMany({ group: groupName }, { operatorId: newOperatorId });
  }

  public async create(data: PbxCallRouting): Promise<PbxCallRouting> {
    const spam = new this.operatorsModel({
      ...data,
    });
    return await spam.save();
  }

  public async delete(filter: { [key: string]: any }) {
    return await this.operatorsModel.deleteOne({ filter });
  }
}
