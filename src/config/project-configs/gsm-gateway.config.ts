import { FactoryProvider, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import configuration from '../config.provider';
import { ConfigEnvironmentVariables, GsmGatewayEnvironmentVariables } from '../interfaces/config.interface';
import * as namiLib from 'nami';

const gsmGatewayAmiFactory = async (gsmConf: GsmGatewayEnvironmentVariables): Promise<any> => {
  return new namiLib.Nami({
    username: gsmConf.username,
    secret: gsmConf.password,
    host: gsmConf.host,
    port: gsmConf.port,
  });
};

const createGsmGatewayProvider = (gsmConf: GsmGatewayEnvironmentVariables): FactoryProvider<any> => {
  return {
    provide: gsmConf.providerName,
    useFactory: async () => {
      return gsmGatewayAmiFactory(gsmConf);
    },
    inject: [ConfigService],
  };
};

export const createGsmGatewayAmi = (): Provider<any>[] => {
  const { gsmGateway } = configuration() as ConfigEnvironmentVariables;
  return gsmGateway.map((gsmConf: GsmGatewayEnvironmentVariables) => {
    return createGsmGatewayProvider(gsmConf);
  });
};

export const getGsmGatewayProvidesName = () => {
  const { gsmGateway } = configuration() as ConfigEnvironmentVariables;
  return gsmGateway.map((gsmConf: GsmGatewayEnvironmentVariables) => {
    return gsmConf.providerName;
  });
};
