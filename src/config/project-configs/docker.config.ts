import { FactoryProvider, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import configuration from '../config.provider';
import { ConfigEnvironmentVariables, DockerEnvironmentVariables } from '../interfaces/config.interface';
import * as Docker from 'dockerode';

const dockerFactory = (docker: DockerEnvironmentVariables): Docker => {
  return new Docker({
    host: docker.host,
    port: docker.port,
  });
};

const createDockerProvider = (docker: DockerEnvironmentVariables): FactoryProvider<any> => {
  return {
    provide: docker.providerName,
    useFactory: () => {
      return dockerFactory(docker);
    },
    inject: [ConfigService],
  };
};

export const createDocker = (): Provider<any>[] => {
  const { docker } = configuration() as ConfigEnvironmentVariables;
  return docker.map((docker: DockerEnvironmentVariables) => {
    return createDockerProvider(docker);
  });
};
