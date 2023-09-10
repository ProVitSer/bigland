import { HttpModuleOptions } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvironmentVariables } from '../interfaces/config.interface';

export const getLdsConfig = async (configService: ConfigService<ConfigEnvironmentVariables>): Promise<HttpModuleOptions> => {
  const { bearer, cookie } = configService.get('lds');
  return {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': configService.get<string>('userAgent'),
      Authorization: `Bearer ${bearer}`,
      Cookie: cookie,
    },
  };
};
