import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

export const getRabbitMQConfig = async (configService: ConfigService): Promise<RabbitMQConfig> => {
  return {
    exchanges: [
      {
        name: 'presence',
        type: 'topic',
      },
    ],
    uri: configService.get<string>('rabbitMqUrl'),
    connectionInitOptions: { wait: false },
    prefetchCount: 1,
  };
};
