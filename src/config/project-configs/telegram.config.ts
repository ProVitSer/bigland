import { ConfigService } from '@nestjs/config';
import { TelegramModuleOptions } from 'nestjs-telegram';
import { ConfigEnvironmentVariables } from '../interfaces/config.interface';

export const getTelegramConfig = async (configService: ConfigService<ConfigEnvironmentVariables> ): Promise<TelegramModuleOptions> => {
    const { token } = configService.get('telegram', {
        infer: true
    });

    return {
        botKey: token,
    };

};