import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly client: Redis) {}

  public async setCustomKey(key: string, value: any, expireTIme = 60 * 60 * 24) {
    return await this.client.set(key, JSON.stringify(value), 'EX', expireTIme);
  }

  public async getCustomKey(key: string) {
    return await this.client.get(key);
  }

  public async updateCustomKey(key: string, value: any, expireTIme = 60 * 60 * 24) {
    await this.client.del(key);
    return await this.setCustomKey(key, value, expireTIme);
  }
  public async ping() {
    return await this.client.ping();
  }
}
