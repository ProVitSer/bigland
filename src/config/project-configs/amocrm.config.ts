import { HttpModuleOptions } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Client } from 'amocrm-js';
import { AmocrmEnvironmentVariables } from '../interfaces/config.interface';

export const getAmocrmV2Config = async (configService: ConfigService): Promise<HttpModuleOptions> => {
  return {
    headers: {
      'User-Agent': configService.get('userAgent'),
      'Content-Type': configService.get('amocrm.v2.contentType'),
    },
    timeout: 5000,
    maxRedirects: 5,
    validateStatus: () => true,
  };
};

export const getAmocrmV4Config = async (configService: ConfigService): Promise<Client> => {
  const { domain, clientId, clientSecret, redirectUri, port } = configService.get('amocrm') as AmocrmEnvironmentVariables;
  return new Client({
    domain,
    auth: {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      server: {
        port: port,
      },
    },
  });
};
