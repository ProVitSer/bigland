import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { ConfigEnvironmentVariables } from '../interfaces/config.interface';

export const getMariadbUseFactory = async (configService: ConfigService<ConfigEnvironmentVariables> ): Promise<SequelizeModuleOptions> => {

    return {
        ...getMariadbConfig(configService),
        ...getMariadbOptions(),
    };
    
};

const getMariadbConfig = (configService: ConfigService<ConfigEnvironmentVariables> ): SequelizeModuleOptions => {
    const {
        username,
        password,
        database,
        host,
        port
    } = configService.get('database.mariadb', {
        infer: true
    });

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