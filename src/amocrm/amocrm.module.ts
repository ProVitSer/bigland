import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AmocrmConnector, AmocrmV2Auth } from './amocrm.connect';
import { Client } from 'amocrm-js';
import { AmocrmV2Service, AmocrmV4Service } from './amocrm.service';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '@app/redis/redis.module';
import { LogModule } from '@app/log/log.module';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Amocrm, AmocrmSchema } from './amocrm.schema';

@Module({
  imports: [
    ConfigModule,
    LogModule,
    RedisModule,
    AsteriskCdrModule,
    MongooseModule.forFeature([{ name: Amocrm.name, schema: AmocrmSchema }]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'User-Agent': configService.get('userAgent'),
          'Content-Type': configService.get('amocrm.v2.contentType'),
        },
        timeout: 5000,
        maxRedirects: 5,
        validateStatus: () => true,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'Amocrm',
      useFactory: (configService: ConfigService) => {
        return new Client({
          domain: configService.get('amocrm.domain'),
          auth: {
            client_id: configService.get('amocrm.clientId'),
            client_secret: configService.get('amocrm.clientSecret'),
            redirect_uri: configService.get('amocrm.redirectUri'),
            server: {
              port: configService.get('amocrm.port'),
            },
          },
        });
      },
      inject: [ConfigService],
    },
    AmocrmConnector,
    AmocrmV4Service,
    AmocrmV2Service,
    AmocrmV2Auth,
  ],
  exports: [AmocrmV4Service, AmocrmV2Service],
})
export class AmocrmModule {}
