import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { DatabaseEnvironmentVariables } from '../interfaces/config.interface';

export const getMariadbUseFactory = async (configService: ConfigService): Promise<SequelizeModuleOptions> => {
  return {
    ...getMariadbConfig(configService),
    ...getMariadbOptions(),
  };
};

const getMariadbConfig = (configService: ConfigService): SequelizeModuleOptions => {
  const { username, password, database, host, port } = configService.get('database.mariadb') as DatabaseEnvironmentVariables;
  return {
    dialect: 'mariadb',
    dialectOptions: {
      connectTimeout: 10000,
    },
    host,
    port,
    username,
    password,
    database,
  };
};

const getMariadbOptions = (): SequelizeModuleOptions => ({
  autoLoadModels: true,
  synchronize: false,
});
