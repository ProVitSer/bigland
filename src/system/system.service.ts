import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GsmGateway, System, SystemDocument } from './system.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SystemService {
  constructor(
    @InjectModel(System.name) private systemModel: Model<SystemDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  public async getConfig(): Promise<System> {
    try {
      return (await this.systemModel.find().sort({ _id: 1 }).limit(1))[0];
    } catch (e) {
      throw e;
    }
  }

  public async updateGsmGatewayConfig(data: GsmGateway): Promise<void> {
    try {
      await this.systemModel.updateOne(
        { 'gsmGateway.port': data.port },
        { $set: { balance: data.balance } },
      );
      this.eventEmitter.emit(`system.change`);
    } catch (e) {
      throw e;
    }
  }

  public async updateChanSpyPassword(
    id: string,
    password: string,
  ): Promise<void> {
    try {
      await this.systemModel.updateOne(
        { _id: id },
        { $set: { chanSpyPassword: password } },
      );
      this.eventEmitter.emit(`system.change`);
    } catch (e) {
      throw e;
    }
  }

  public async addNewChanSpyPassword(password: string): Promise<void> {
    try {
      const system = await this.getConfig();
      await this.updateChanSpyPassword(system._id, password);
      this.eventEmitter.emit(`system.change`);
    } catch (e) {
      throw e;
    }
  }
}
