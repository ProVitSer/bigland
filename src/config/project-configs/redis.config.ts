import { RedisClientOptions, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { RedisEnvironmentVariables } from '../interfaces/config.interface';

export const getRedisConfig = (configService: ConfigService): RedisModuleOptions => {
  return { config: getRedisClientOptions(configService) };
};

const getRedisClientOptions = (configService: ConfigService): RedisClientOptions | RedisClientOptions[] => {
  const redisConf = configService.get('redis') as RedisEnvironmentVariables | RedisEnvironmentVariables[];
  if (Array.isArray(redisConf)) {
    return redisConf.map((conf: RedisEnvironmentVariables) => {
      return formatOptions(conf);
    });
  } else {
    return formatOptions(redisConf);
  }
};

const formatOptions = (conf: RedisEnvironmentVariables) => {
  return {
    host: conf.host,
    port: conf.port,
    password: conf.password,
  };
};
