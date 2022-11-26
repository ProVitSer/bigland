import { Module } from '@nestjs/common';
import { CdrService } from './cdr.service';
import { RabbitMQConfig, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CdrMessagingService } from './cdr.subscribers';
import { MongooseModule } from '@nestjs/mongoose';
import { Cdr, CdrSchema } from './cdr.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cdr.name, schema: CdrSchema }]),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RabbitMQConfig> => ({
        exchanges: [
          {
            name: 'presence',
            type: 'topic',
          },
        ],
        uri: configService.get('rabbitMqUrl'),
        connectionInitOptions: { wait: false },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CdrService, CdrMessagingService],
})
export class CdrModule {}
