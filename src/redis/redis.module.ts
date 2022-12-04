import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisModule as NestRedis } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    NestRedis.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return { config: configService.get('redis') };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [RedisService],
  providers: [RedisService],
})
export class RedisModule {}
