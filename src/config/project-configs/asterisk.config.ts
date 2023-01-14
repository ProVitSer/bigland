import { FactoryProvider, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ARI from 'ari-client';
import * as namiLib from 'nami';
import {
  AmiAsteriskEnvironmentVariables,
  AriAsteriskEnvironmentVariables,
  ConfigEnvironmentVariables,
} from '../interfaces/config.interface';
import configuration from '../config.provider';

const asteriskAriFactory = async (ari: AriAsteriskEnvironmentVariables): Promise<any> => {
  return {
    ariClient: await ARI.connect(ari.url, ari.user, ari.password),
  };
};

const createAsteriskAriProvider = (ari: AriAsteriskEnvironmentVariables): FactoryProvider<any> => {
  return {
    provide: ari.providerName,
    useFactory: async () => {
      return asteriskAriFactory(ari);
    },
    inject: [ConfigService],
  };
};

export const createAsteriskAri = (): Provider<any>[] => {
  const { asterisk } = configuration() as ConfigEnvironmentVariables;
  return asterisk.ari.map((ariApplicationConf: AriAsteriskEnvironmentVariables) => {
    return createAsteriskAriProvider(ariApplicationConf);
  });
};

export const getAsteriskAriProvidesName = () => {
  const { asterisk } = configuration() as ConfigEnvironmentVariables;
  return asterisk.ari.map((ariApplicationConf: AriAsteriskEnvironmentVariables) => {
    return ariApplicationConf.providerName;
  });
};

const asteriskAmiFactory = async (ami: AmiAsteriskEnvironmentVariables): Promise<any> => {
  return new namiLib.Nami({
    username: ami.username,
    secret: ami.password,
    host: ami.host,
    port: ami.port,
  });
};

const createAsteriskAmiProvider = (ami: AmiAsteriskEnvironmentVariables): FactoryProvider<any> => {
  return {
    provide: ami.providerName,
    useFactory: async () => {
      return asteriskAmiFactory(ami);
    },
    inject: [ConfigService],
  };
};

export const createAsteriskAmi = (): Provider<any>[] => {
  const { asterisk } = configuration() as ConfigEnvironmentVariables;
  return asterisk.ami.map((amiApplicationConf: AmiAsteriskEnvironmentVariables) => {
    return createAsteriskAmiProvider(amiApplicationConf);
  });
};

export const getAsteriskAmiProvidesName = () => {
  const { asterisk } = configuration() as ConfigEnvironmentVariables;
  return asterisk.ami.map((amiApplicationConf: AmiAsteriskEnvironmentVariables) => {
    return amiApplicationConf.providerName;
  });
};
