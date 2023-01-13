import { FactoryProvider, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ARI from 'ari-client';
import * as namiLib from 'nami';
import { AmiAsteriskEnvironmentVariables, AsteriskEnvironmentVariables } from './interfaces/config.interface';
export const ASTERISK_ARI_PROVIDER = ['CHANSPY', 'AMOCRM', 'BLACKLIST', 'ARICALL'];

const asteriskAriFactory = async (provideName: string, configService: ConfigService): Promise<any> => {
  const { ari } = configService.get('asterisk') as AsteriskEnvironmentVariables;
  const { application } = ari;
  return {
    ariClient: await ARI.connect(ari.url, application[provideName.toLowerCase()].user, application[provideName.toLowerCase()].password),
  };
};

const createLoggerProvider = (provideName: string): FactoryProvider<any> => {
  return {
    provide: provideName,
    useFactory: async (configService: ConfigService) => {
      return asteriskAriFactory(provideName, configService);
    },
    inject: [ConfigService],
  };
};

export const createAsteriskAri = (): Provider<any>[] => {
  return ASTERISK_ARI_PROVIDER.map((provideName: string) => {
    return createLoggerProvider(provideName);
  });
};

export const getAsteriskAmiFactory = async (configService: ConfigService): Promise<any> => {
  const { username, host, port, password } = configService.get('asterisk.ami') as AmiAsteriskEnvironmentVariables;
  return new namiLib.Nami({
    username,
    secret: password,
    host,
    port,
  });
};
