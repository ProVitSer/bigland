import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvironmentVariables } from '../interfaces/config.interface';

export const getRabbitMQConfig = async (configService: ConfigService<ConfigEnvironmentVariables>): Promise<RabbitMQConfig> => {
  return {
    exchanges: [
      {
        name: 'presence',
        type: 'topic',
      },
    ],
    uri: configService.get('rabbitMqUrl'),
    connectionInitOptions: {
      wait: false,
    },
    channels: {
      cdr: {
        prefetchCount: 1,
      },
      'freepbx-api': {
        prefetchCount: 1,
      },
    },
  };
};
