import { LogService } from '@app/log/log.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, LdsUserStatusResponse } from './interfaces/lds.interfaces';
import { Lds, LdsDocument } from './lds.schema';

@Injectable()
export class LdsService {
  constructor(
    private readonly log: LogService,
    private httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Lds.name) private lsdModel: Model<LdsDocument>,
  ) {}

  public async getLSDUserStatus(): Promise<LdsUserStatusResponse> {
    try {
      return (await this.httpService.get(this.configService.get('lds.url')).toPromise()).data;
    } catch (e) {
      throw e;
    }
  }

  public async renewLdsUserStatus(ldsUsers: LdsUserStatusResponse): Promise<void> {
    try {
      await this.lsdModel.deleteMany({});
      await Promise.all(
        ldsUsers.items.map(async (item: Item) => {
          const lds = new this.lsdModel({
            ...item,
          });
          return await lds.save();
        }),
      );
    } catch (e) {
      throw e;
    }
  }

  public async getLdsUser(): Promise<Lds[]> {
    return await this.lsdModel.find();
  }
}
