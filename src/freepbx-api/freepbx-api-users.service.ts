import { LogService } from '@app/log/log.service';
import { MailService } from '@app/mail/mail.service';
import { Injectable } from '@nestjs/common';
import { FreePBXCreateUsersDto, Users } from './dto/freepbx-create-users.dto';
import { FreepbxCreateUser } from './freepbx-selenium/create-user';
import { CreateUserResult } from './interfaces/freepbx-api.interfaces';
import { TemplateTypes } from '@app/mail/interfaces/mail.enum';
import { SendMailData } from '@app/mail/interfaces/mail.interfaces';
import { ConfigService } from '@nestjs/config';
import { SystemService } from '@app/system/system.service';
import { Login } from './freepbx-selenium/login';
import { PbxCallRoutingService } from '@app/pbx-call-routing/services/pbx-call-routing.service';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { FreePBXDeleteUsersDto } from './dto/freepbx-delete-users.dto';
import { TelegramService } from '@app/telegram/telegram.service';

@Injectable()
export class FreepbxUsersApiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly freepbxCreateser: FreepbxCreateUser,
    private readonly mailService: MailService,
    private readonly systemService: SystemService,
    private readonly freePBXLogin: Login,
    private readonly pbxCallRoutingService: PbxCallRoutingService,
    private readonly tg: TelegramService,
  ) {}

  public async createUsers(users: FreePBXCreateUsersDto): Promise<boolean> {
    try {
      this.createFreepbxUser(users);
      return true;
    } catch (e) {
      throw e;
    }
  }

  public async deleteUsers(data: FreePBXDeleteUsersDto): Promise<boolean> {
    try {
      for (const ext of data.extensions) {
        await this.pbxCallRoutingService.deleteExtensionRoute(ext);
        await this.systemService.addAvailableExtension(ext);
      }
      await this.tg.tgAlert(`Номера на удаление ${data.extensions.join(',')}`, FreepbxUsersApiService.name);
      return true;
    } catch (e) {
      throw e;
    }
  }

  private async createFreepbxUser(data: FreePBXCreateUsersDto) {
    try {
      for (const user of data.users) {
        const webDriver = await this.freePBXLogin.loginOnPbx();
        const extension = await this.getNewExtension();
        const createUserData = await this.freepbxCreateser.createPbxUser({
          firstName: user.firstName,
          lastName: user.lastName,
          extension,
          webDriver,
        });
        await this.pbxCallRoutingService.addExtensionsRoute([{ localExtension: extension, operatorName: OperatorsName.mango }]);
        await this.sendDataToUser(user, createUserData);
      }
    } catch (e) {
      this.log.error(e, FreepbxUsersApiService.name);
    }
  }

  private async sendDataToUser(user: Users, data: CreateUserResult) {
    try {
      const mailData: SendMailData = {
        to: user.email,
        context: {
          username: `${user.firstName} ${user.lastName}`,
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

  private async getNewExtension(): Promise<string> {
    return await this.systemService.getAvailableExtension();
  }
}
