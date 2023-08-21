import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GsmGateway, System, SystemDocument } from './system.schema';

@Injectable()
export class SystemService {
  constructor(@InjectModel(System.name) private systemModel: Model<SystemDocument>) {}

  public async getConfig(): Promise<System> {
    try {
      return (await this.systemModel.find().sort({ _id: 1 }).limit(1))[0];
    } catch (e) {
      throw e;
    }
  }

  public async updateGsmGatewayConfig(data: GsmGateway): Promise<void> {
    try {
      await this.systemModel.updateOne({ 'gsmGateway.port': data.port }, { $set: { balance: data.balance } });
    } catch (e) {
      throw e;
    }
  }

  public async updateChanSpyPassword(id: string, password: string): Promise<void> {
    try {
      await this.systemModel.updateOne({ _id: id }, { $set: { chanSpyPassword: password } });
    } catch (e) {
      throw e;
    }
  }

  public async addNewChanSpyPassword(password: string): Promise<void> {
    try {
      const system = await this.getConfig();
      await this.updateChanSpyPassword(system._id, password);
    } catch (e) {
      throw e;
    }
  }

  public async getAvailableExtension(): Promise<string> {
    try {
      const system = await this.getConfig();
      const extension = system.freepbxAvailableExtension.shift();
      await this.systemModel.updateOne({ _id: system._id }, { $set: { freepbxAvailableExtension: system.freepbxAvailableExtension } });
      return extension;
    } catch (e) {
      throw e;
    }
  }

  public async addAvailableExtension(extension: string): Promise<void> {
    try {
      const system = await this.getConfig();
      if (!system.freepbxAvailableExtension.includes(extension)) {
        system.freepbxAvailableExtension.push(extension);
      }
      await this.systemModel.updateOne({ _id: system._id }, { $set: { freepbxAvailableExtension: system.freepbxAvailableExtension } });
    } catch (e) {
      throw e;
    }
  }
}
