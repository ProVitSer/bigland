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
    host,
    port,
    username,
    password,
    database,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };
};

const getMariadbOptions = (): SequelizeModuleOptions => ({
  autoLoadModels: true,
  synchronize: false,
});
