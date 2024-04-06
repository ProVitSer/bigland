import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigEnvironmentVariables } from '../interfaces/config.interface';

export const getMongoUseFactory = async (
    configService: ConfigService<ConfigEnvironmentVariables> ,
): Promise<MongooseModuleFactoryOptions> => {

    return {
        uri: getMongoString(configService),
        ...getMongoOptions(),
    };
    
};

const getMongoString = (configService: ConfigService<ConfigEnvironmentVariables> ): string => {
    const {
        username,
        password,
        database,
        host,
        port
    } = configService.get('database.mongo', {
        infer: true
    });

    return `mongodb://${username}:${password}@${host}:${port}/${database}`;

};

const getMongoOptions = (): MongooseModuleOptions => ({});