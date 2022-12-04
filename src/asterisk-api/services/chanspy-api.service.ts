import { RedisService } from '@app/redis/redis.service';
import { System } from '@app/system/system.schema';
import { SystemService } from '@app/system/system.service';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { ChanspyDto } from '../dto/chanspy.dto';
import { ChanspyPasswordResult } from '../interfaces/asterisk-api.interfaces';

@Injectable()
export class ChanspyApiService {
  constructor(
    private readonly configProject: SystemService,
    private readonly redis: RedisService,
    private readonly systemService: SystemService,
  ) {}

  public async getPassword(): Promise<ChanspyPasswordResult> {
    try {
      const result = await this.redis.getCustomKey('config');
      const configJson = JSON.parse(result) as System;
      return { password: configJson.chanSpyPassword };
    } catch (e) {
      throw e;
    }
  }

  public async updatePassword(data: ChanspyDto): Promise<void> {
    try {
      const currentConfig = await this.configProject.getConfig();
      return await this.systemService.updateChanSpyPassword(
        currentConfig._id,
        data.password,
      );
    } catch (e) {
      throw e;
    }
  }

  public async generatePassword(): Promise<ChanspyPasswordResult> {
    try {
      const newPassword = UtilsService.generateRandomNumber(4);
      const currentConfig = await this.configProject.getConfig();
      await this.systemService.updateChanSpyPassword(
        currentConfig._id,
        newPassword,
      );
      return { password: newPassword };
    } catch (e) {
      throw e;
    }
  }
}
