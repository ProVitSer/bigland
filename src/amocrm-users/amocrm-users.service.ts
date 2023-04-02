import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmocrmUsers, AmocrmUsersDocument } from './amocrm-users.schema';

@Injectable()
export class AmocrmUsersService {
  constructor(
    @InjectModel(AmocrmUsers.name)
    private amocrmUsersModel: Model<AmocrmUsersDocument>,
  ) {}

  public async getAmocrmUser(extension: string): Promise<AmocrmUsers[]> {
    try {
      return await this.amocrmUsersModel.find({ localExtension: extension });
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

  public async clearCollection(): Promise<void> {
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
}
