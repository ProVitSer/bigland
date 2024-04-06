import { Module } from '@nestjs/common';
import { LogModule } from './log/log.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';
import { CdrModule } from './cdr/cdr.module';
import { LdsModule } from './lds/lds.module';
import configuration from './config/config.provider';
import { DockerModule } from './docker/docker.module';
import { SeleniumModule } from './selenium/selenium.module';
import { HttpResponseModule } from './http/http.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './utils/utils.module';
import { MongooseModule } from '@nestjs/mongoose';
import { FreepbxApiModule } from './freepbx-api/freepbx-api.module';
import { MailModule } from './mail/mail.module';
import { SystemModule } from './system/system.module';
import { RedisModule } from './redis/redis.module';
import { AsteriskCdrModule } from './asterisk-cdr/asterisk-cdr.module';
import { AmocrmUsersModule } from './amocrm-users/amocrm-users.module';
import { AsteriskApiModule } from './asterisk-api/asterisk-api.module';
import { AmocrmModule } from './amocrm/amocrm.module';
import { getMongoUseFactory } from './config/project-configs/mongo.config';
import { OperatorsModule } from './operators/operators.module';
import { ReportsModule } from './reports/reports.module';
import { FilesApiModule } from './files-api/files-api.module';
import { ServerStaticModule } from './server-static/server-static.module';
import { SpamApiModule } from './spam-api/spam-api.module';
import { BiglandModule } from './bigland/bigland.module';
import { PbxCallRoutingModule } from './pbx-call-routing/pbx-call-routing.module';
import { ProxyCallingTtsModule } from './proxy-calling-tts/proxy-calling-tts.module';
import { AriModule } from './asterisk/ari/ari.module';
import { AmiModule } from './asterisk/ami/ami.module';
import { AllExceptionsFilter } from './http/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { RabbitModule } from './rabbit/rabbit.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration]
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: getMongoUseFactory,
            inject: [ConfigService],
        }),
        LogModule,
        TelegramModule,
        CdrModule,
        LdsModule,
        DockerModule,
        SeleniumModule,
        HttpResponseModule,
        AuthModule,
        UsersModule,
        UtilsModule,
        FreepbxApiModule,
        MailModule,
        SystemModule,
        RedisModule,
        AmiModule,
        AriModule,
        AsteriskCdrModule,
        AmocrmUsersModule,
        AsteriskApiModule,
        AmocrmModule,
        OperatorsModule,
        ReportsModule,
        FilesApiModule,
        ServerStaticModule,
        SpamApiModule,
        BiglandModule,
        PbxCallRoutingModule,
        ProxyCallingTtsModule,
        RabbitModule,
    ],
    controllers: [],
    providers: [{
        provide: APP_FILTER,
        useClass: AllExceptionsFilter,
    }, ],
    exports: [ConfigModule],
})
export class AppModule {}