import { DataObject } from '@app/platform-types/common/interfaces';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Spam } from '../spam.schema';
import * as moment from 'moment';
import { SpamType } from '../interfaces/spam-api.enum';
import { SPAM_REPORT_DATE_FORMAT } from '../spam-api.constants';
import { ActualSpamReportInfo } from '../interfaces/spam-api.interfaces';

@Injectable()
export class SpamModelService {
  constructor(@InjectModel(Spam.name) private spamModel: Model<Spam>) {}

  public async create(data: Spam): Promise<Spam> {
    const spam = new this.spamModel({
      ...data,
    });
    return await spam.save();
  }

  public async update(applicationId: string, data: DataObject) {
    return await this.spamModel.updateOne({ applicationId: applicationId }, { $set: { ...data } });
  }

  public async findByApplicationId(applicationId: string) {
    return await this.spamModel.findOne({ applicationId }, { _id: 0 });
  }

  public async getActualSpamReportInfo(dateString: string): Promise<ActualSpamReportInfo[]> {
    const date = moment(dateString, SPAM_REPORT_DATE_FORMAT);
    const startDate = date.startOf('day').add(3, 'hours').toDate();
    const endDate = date.endOf('day').add(3, 'hours').toDate();
    const result = await this.spamModel
      .aggregate([
        {
          $match: {
            spamType: SpamType.allOperators,
            checkDate: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $project: {
            _id: 0,
            applicationId: -1,
            status: -1,
            resultSpamCheck: -1,
            checkDate: 1,
          },
        },
        {
          $sort: {
            checkDate: -1,
          },
        },
        {
          $limit: 1,
        },
      ])
      .exec();

    return result;
  }
}
