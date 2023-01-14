import { ConfigService } from '@nestjs/config';
import { TelegramModuleOptions } from 'nestjs-telegram';
import { TelegramEnvironmentVariables } from '../interfaces/config.interface';

export const getTelegramConfig = async (configService: ConfigService): Promise<TelegramModuleOptions> => {
  const { token } = configService.get('telegram') as TelegramEnvironmentVariables;
  return {
    botKey: token,
  };
};
