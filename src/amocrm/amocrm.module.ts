import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AmocrmConnector, AmocrmV2Auth } from './amocrm.connect';
import { AmocrmV2Service, AmocrmV4Service } from './amocrm.service';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '@app/redis/redis.module';
import { LogModule } from '@app/log/log.module';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Amocrm, AmocrmSchema } from './amocrm.schema';
import { getAmocrmV2Config, getAmocrmV4Config } from '@app/config/project-configs/amocrm.config';

@Module({
  imports: [
    ConfigModule,
    LogModule,
    RedisModule,
    AsteriskCdrModule,
    MongooseModule.forFeature([{ name: Amocrm.name, schema: AmocrmSchema }]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getAmocrmV2Config,
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'Amocrm',
      useFactory: getAmocrmV4Config,
      inject: [ConfigService],
    },
    AmocrmConnector,
    AmocrmV4Service,
    AmocrmV2Service,
    AmocrmV2Auth,
  ],
  exports: [AmocrmV4Service, AmocrmV2Service, AmocrmConnector],
})
export class AmocrmModule {}
