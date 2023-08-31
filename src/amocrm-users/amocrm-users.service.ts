import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmocrmUsers, AmocrmUsersDocument } from './amocrm-users.schema';
import { LdsService } from '@app/lds/lds.service';
import { Lds } from '@app/lds/lds.schema';
import * as moment from 'moment';
import { DATE_FORMAT } from './amocrm-users.constants';

@Injectable()
export class AmocrmUsersService {
  constructor(
    @InjectModel(AmocrmUsers.name)
    private amocrmUsersModel: Model<AmocrmUsersDocument>,
    private readonly ldsService: LdsService,
  ) {}

  public async getAmocrmUser(extension: string): Promise<AmocrmUsers[]> {
    try {
      return await this.amocrmUsersModel.find({ localExtension: extension });
    } catch (e) {
      throw e;
    }
  }

  public async getUserByAmocrmId(amocrmId: number): Promise<AmocrmUsers | null> {
    try {
      return await this.amocrmUsersModel.findOne({ amocrmId });
    } catch (e) {
      throw e;
    }
  }

  public async getAmocrmUsers(): Promise<AmocrmUsers[]> {
    try {
      return await this.amocrmUsersModel.find();
    } catch (e) {
      throw e;
    }
  }

  private async clearCollection(): Promise<void> {
    try {
      await this.amocrmUsersModel.deleteMany({});
    } catch (e) {
      throw e;
    }
  }

  public async addUsers(users: AmocrmUsers[]): Promise<void> {
    try {
      await Promise.all(
        users.map(async (formatLdsUser: AmocrmUsers) => {
          const amocrmUsers = new this.amocrmUsersModel({
            ...formatLdsUser,
          });
          return await amocrmUsers.save();
        }),
      );
    } catch (e) {
      throw e;
    }
  }

  public async updateAmocrmUsers() {
    try {
      const lds = await this.ldsService.getLdsUser();
      if (this.checkNeedUpdate(lds)) {
        await this.clearCollection();
        const formatLds = this.formatLdsUsers(lds);
        await this.addUsers(formatLds);
      }
    } catch (e) {
      throw e;
    }
  }

  private checkNeedUpdate(ldsUsers: Lds[]): boolean {
    const now = moment().format(DATE_FORMAT);
    const ldsUpdateTime = moment(ldsUsers[0].changed).format(DATE_FORMAT);
    return now == ldsUpdateTime;
  }

  private formatLdsUsers(ldsUsers: Lds[]): AmocrmUsers[] {
    const formatLdsUsers: AmocrmUsers[] = [];
    ldsUsers.map((ldsUser: Lds) => {
      if (ldsUser.sip_id !== null) {
        formatLdsUsers.push({
          localExtension: ldsUser.sip_id,
          amocrmId: ldsUser.amo[0].amo_id,
        });
      }
    });
    return formatLdsUsers;
  }
}
