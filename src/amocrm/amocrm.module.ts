import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LogModule } from '@app/log/log.module';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Amocrm, AmocrmSchema } from './amocrm.schema';
import { getAmocrmV2Config, getAmocrmV4Config } from '@app/config/project-configs/amocrm.config';
import { ScheduleModule } from '@nestjs/schedule';
import { AmocrmUpdateTokenSchedule } from './schedule/amocrm-update-token';
import { TelegramModule } from '@app/telegram/telegram.module';
import { SystemModule } from '@app/system/system.module';
import { AmocrmUsersModule } from '@app/amocrm-users/amocrm-users.module';
import { AmocrmV2ApiService, AmocrmV2AuthService } from './v2/services';
import { AmocrmV4ApiService, AmocrmV4AuthService, AmocrmV4RequestService, AmocrmV4Service } from './v4/services';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule,
        LogModule,
        SystemModule,
        AsteriskCdrModule,
        MongooseModule.forFeature([{
            name: Amocrm.name,
            schema: AmocrmSchema
        }]),
        HttpModule.registerAsync({
            imports: [ConfigModule],
            useFactory: getAmocrmV2Config,
            inject: [ConfigService],
        }),
        TelegramModule,
        AmocrmUsersModule,
    ],
    providers: [{
            provide: 'AMOCRM',
            useFactory: getAmocrmV4Config,
            inject: [ConfigService],
        },

        AmocrmV4AuthService,
        AmocrmV2AuthService,
        AmocrmV2ApiService,
        AmocrmUpdateTokenSchedule,
        AmocrmV4ApiService,
        AmocrmV4Service,
        AmocrmV4RequestService,
    ],
    exports: [AmocrmV4Service, AmocrmV2AuthService, AmocrmV2ApiService],
})
export class AmocrmModule {}