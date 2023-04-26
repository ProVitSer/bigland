import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisModule as NestRedis } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRedisConfig } from '@app/config/project-configs/redis.config';

@Module({
  imports: [
    ConfigModule,
    NestRedis.forRootAsync({
      imports: [ConfigModule],
      useFactory: getRedisConfig,
      inject: [ConfigService],
    }),
  ],
  exports: [RedisService],
  providers: [RedisService],
})
export class RedisModule {}
