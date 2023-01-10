import { Module } from '@nestjs/common';
import { CdrService } from './cdr.service';
import { RabbitMQConfig, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CdrMessagingService } from './cdr.subscribers';
import { MongooseModule } from '@nestjs/mongoose';
import { Cdr, CdrSchema } from './cdr.schema';
import { LogModule } from '@app/log/log.module';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { AmocrmModule } from '@app/amocrm/amocrm.module';
import { AmocrmUsersModule } from '@app/amocrm-users/amocrm-users.module';

@Module({
  imports: [
    LogModule,
    AsteriskCdrModule,
    AmocrmModule,
    AmocrmUsersModule,
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
