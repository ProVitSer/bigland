import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, LdsUseresponse } from './interfaces/lds.interfaces';
import { Lds, LdsDocument } from './lds.schema';
import { AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';

@Injectable()
export class LdsService {
  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Lds.name) private lsdModel: Model<LdsDocument>,
  ) {}

  public async updateLds(): Promise<void> {
    try {
      const result = await this.getLSDUserStatus();
      await this.renewLdsUser(result);
    } catch (e) {
      throw e;
    }
  }

  private async getLSDUserStatus(): Promise<LdsUseresponse> {
    try {
      const result = await firstValueFrom(
        this.httpService.get(this.configService.get('lds.url')).pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
      );
      return result.data;
    } catch (e) {
      throw e;
    }
  }

  private async renewLdsUser(ldsUsers: LdsUseresponse): Promise<void> {
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
