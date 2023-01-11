import { RedisService } from '@app/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SystemService } from './system.service';

@Injectable()
export class SystemUpdateListener {
  constructor(private readonly redis: RedisService, private readonly systemConfig: SystemService) {}

  @OnEvent('system.change')
  async updateSystemConf() {
    const newConfig = await this.systemConfig.getConfig();
    return await this.redis.updateCustomKey('config', newConfig);
  }
}
