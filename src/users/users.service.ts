import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users, UsersDocument } from './users.schema';
import * as bcrypt from 'bcrypt';
import { v1 as uuid } from 'uuid';
import { CreateUser } from './interfaces/users.interfaces';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private usersModel: Model<UsersDocument>) {}

  public async getByEmail(email: string): Promise<Users> {
    try {
      const user = await this.usersModel.findOne({ email });
      return user;
    } catch (e) {
      throw e;
    }
  }

  public async getActiveUserById(userId: string): Promise<Users | null> {
    const user = await this.usersModel.findOne({ userId });
    if (!!user) {
      return this.checkActive(user) ? user : null;
    }
    return user;
  }

  private checkActive(user: Users): boolean {
    return user.isActive;
  }

  public async create(userData: CreateUser): Promise<Users> {
    try {
      const user = new this.usersModel({
        userId: uuid(),
        ...userData,
      });
      return await user.save();
    } catch (e) {
      throw e;
    }
  }

  public async setCurrentRefreshToken(refreshToken: string, userId: string): Promise<Users> {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const user = await this.usersModel.findByIdAndUpdate(userId, currentHashedRefreshToken);
    return user;
  }

  public async removeRefreshToken(userId: string): Promise<Users> {
    const user = await this.usersModel.findByIdAndUpdate(userId, {
      currentHashedRefreshToken: null,
    });
    return user;
  }

  public async getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<Users> {
    const user = await this.getActiveUserById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);

    if (isRefreshTokenMatching) {
      return user;
    }
  }
}
