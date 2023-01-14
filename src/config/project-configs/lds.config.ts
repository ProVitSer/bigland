import { HttpModuleOptions } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

export const getLdsConfig = async (configService: ConfigService): Promise<HttpModuleOptions> => {
  return {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': configService.get('userAgent'),
      Authorization: `Bearer ${configService.get('lds.bearer')}`,
      Cookie: configService.get('lds.cookie'),
    },
  };
};
