import { Injectable } from '@nestjs/common';
import { SmsStatusDescription } from '../interfaces/gsm-gateway-api.enum';
import {
  ScheduledSMSData,
  UpdateSMSData,
} from '../interfaces/gsm-gateway-api.interfaces';
import { Sms, SmsDocument } from './sms.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SmsService {
  constructor(@InjectModel(Sms.name) private smsModel: Model<SmsDocument>) {}

  public async addSmsInfo(smsInfo: ScheduledSMSData): Promise<Sms> {
    try {
      const isSmsAdd = await this.getSmsStatusById(smsInfo.unicid);
      if (isSmsAdd.length == 0) {
        const sms = new this.smsModel({
          ...smsInfo,
        });
        return await sms.save();
      }
    } catch (e) {
      throw e;
    }
  }

  public async updateSmsStatusById(
    unicid: string,
    info: UpdateSMSData,
  ): Promise<void> {
    try {
      await this.smsModel.updateOne({ unicid }, { $set: { ...info } });
    } catch (e) {
      throw e;
    }
  }

  public async getSmsStatusById(unicid: string): Promise<Sms[]> {
    try {
      return await this.smsModel.find({ unicid });
    } catch (e) {
      throw e;
    }
  }

  public async deleteSms(unicid: string): Promise<any> {
    try {
      return await this.smsModel.deleteOne({ unicid });
    } catch (e) {
      throw e;
    }
  }

  public async getScheduledSms(): Promise<Sms[]> {
    try {
      const criteria = {
        status: SmsStatusDescription.scheduled,
      };
      return await this.smsModel.find({ ...criteria });
    } catch (e) {
      throw e;
    }
  }
}
