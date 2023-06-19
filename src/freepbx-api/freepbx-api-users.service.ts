import { LogService } from '@app/log/log.service';
import { MailService } from '@app/mail/mail.service';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { CreateUsersDto, Users } from './dto/create-users.dto';
import { FreepbxApi, FreepbxApiDocument } from './freepbx-api.schema';
import { FreepbxCreateUser } from './freepbx-selenium/create-user';
import { CreateFreepbxUser, CreateUserResult, ResultCreateUsers, UpdateCreateUser } from './interfaces/freepbx-api.interfaces';
import { FreepbxApiStatus } from './interfaces/freepbx-api.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TemplateTypes } from '@app/mail/interfaces/mail.enum';
import { SendMailData } from '@app/mail/interfaces/mail.interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FreepbxUsersApiService {
  private user: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly freepbxCreateser: FreepbxCreateUser,
    private readonly mailService: MailService,
    @InjectModel(FreepbxApi.name)
    private freepbxApiModel: Model<FreepbxApiDocument>,
  ) {}

  public async createUsers(users: CreateUsersDto): Promise<ResultCreateUsers> {
    try {
      const apiId = (await this.create(users)).apiId;
      this.createFreepbxUser({ apiId, ...users });
      return { apiId };
    } catch (e) {
      throw e;
    }
  }

  private async createFreepbxUser(data: CreateFreepbxUser) {
    try {
      Promise.all(
        data.users.map(async (user: Users) => {
          this.user = user.username;
          const createUserData = await this.freepbxCreateser.createPbxUser(user);
          await this.sendDataToUser(user, createUserData);
          await this.updateCreateUser(data.apiId, this.user, {
            status: FreepbxApiStatus.success,
            ...createUserData,
          });
        }),
      );
    } catch (e) {
      this.log.error(e, FreepbxUsersApiService.name);
      await this.updateCreateUser(data.apiId, this.user, {
        status: FreepbxApiStatus.failed,
        message: e.message || e,
      });
    }
  }

  private async sendDataToUser(user: Users, data: CreateUserResult) {
    try {
      const mailData: SendMailData = {
        to: user.email,
        context: {
          username: user.username,
          extension: data.extension,
          password: data.password,
        },
        template: TemplateTypes.userCreate,
        from: this.configService.get('mail.from'),
        subject: `Авторизационные данные для добавочного ${data.extension}`,
      };
      await this.mailService.sendMail(mailData);
    } catch (e) {
      throw e;
    }
  }

  private async create(users: CreateUsersDto) {
    try {
      const freepbx = new this.freepbxApiModel({
        ...users,
      });
      return await freepbx.save();
    } catch (e) {
      throw e;
    }
  }

  private async updateCreateUser(apiId: string, username: string, info: UpdateCreateUser) {
    try {
      const setData = UtilsService.createSetObj('users', info);
      await this.freepbxApiModel.updateOne({ apiId, 'users.username': username }, { $set: { ...setData } });
    } catch (e) {
      this.log.error(e, FreepbxUsersApiService.name);
    }
  }
}
