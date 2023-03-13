import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LogModule } from '@app/log/log.module';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Amocrm, AmocrmSchema } from './amocrm.schema';
import { getAmocrmV2Config, getAmocrmV4Config } from '@app/config/project-configs/amocrm.config';
import { AmocrmV2Connector } from './v2/amocrm-v2.connect';
import { AmocrmV4Connector } from './v4/amocrm-v4.connect';
import { AmocrmV4Service } from './v4/amocrm-v4.service';
import { AmocrmV2Service } from './v2/amocrm-v2.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AmocrmUpdateTokenSchedule } from './schedule/update-token';
import { TelegramModule } from '@app/telegram/telegram.module';
import { SystemModule } from '@app/system/system.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    LogModule,
    SystemModule,
    AsteriskCdrModule,
    MongooseModule.forFeature([{ name: Amocrm.name, schema: AmocrmSchema }]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getAmocrmV2Config,
      inject: [ConfigService],
    }),
    TelegramModule,
  ],
  providers: [
    {
      provide: 'Amocrm',
      useFactory: getAmocrmV4Config,
      inject: [ConfigService],
    },
    AmocrmV2Connector,
    AmocrmV4Connector,
    AmocrmV4Service,
    AmocrmV2Service,
    AmocrmUpdateTokenSchedule,
  ],
  exports: [AmocrmV4Service, AmocrmV2Service, AmocrmV4Connector],
})
export class AmocrmModule {}
