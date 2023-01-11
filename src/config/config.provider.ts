import { LogService } from '@app/log/log.service';
import { RedisService } from '@app/redis/redis.service';
import { SystemService } from '@app/system/system.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

const CONFIG_FILE = 'config.json';

export default () => {
  return JSON.parse(readFileSync(join(__dirname, CONFIG_FILE), 'utf8'));
};

@Injectable()
export class InitSystemConfig implements OnModuleInit {
  constructor(private readonly redis: RedisService, private readonly systemColService: SystemService, private readonly log: LogService) {}
  async onModuleInit() {
    try {
      const systemConf = await this.systemColService.getConfig();
      await this.redis.setCustomKey('config', systemConf);
    } catch (e) {
      this.log.error(e, InitSystemConfig.name);
    }
  }
}
