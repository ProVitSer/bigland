import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users, UsersDocument } from './users.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { USER_NOT_FOUND } from './users.constants';

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

  async getById(id: string) {
    const user = await this.usersModel.findById(id);
    if (user) {
      return user;
    }
    throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  public async create(userData: CreateUserDto): Promise<Users> {
    try {
      const user = new this.usersModel({
        ...userData,
      });
      return await user.save();
    } catch (e) {
      throw e;
    }
  }

  public async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const user = await this.usersModel.findByIdAndUpdate(userId, currentHashedRefreshToken);
    return user;
  }

  public async removeRefreshToken(userId: string) {
    const user = await this.usersModel.findByIdAndUpdate(userId, {
      currentHashedRefreshToken: null,
    });
    return user;
  }

  public async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.getById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);

    if (isRefreshTokenMatching) {
      return user;
    }
  }
}
