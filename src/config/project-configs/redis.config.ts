import { RedisClientOptions, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvironmentVariables, RedisEnvironmentVariables } from '../interfaces/config.interface';

export const getRedisConfig = (configService: ConfigService<ConfigEnvironmentVariables>): RedisModuleOptions => {
  return { config: getRedisClientOptions(configService) };
};

const getRedisClientOptions = (configService: ConfigService<ConfigEnvironmentVariables>): RedisClientOptions | RedisClientOptions[] => {
  const redisConf = configService.get('redis', { infer: true });
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
