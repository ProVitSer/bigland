import { Module } from '@nestjs/common';
import { LogModule } from './log/log.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';
import { CdrModule } from './cdr/cdr.module';
import { LdsModule } from './lds/lds.module';
import configuration, { InitSystemConfig } from './config/config.provider';
import { DockerModule } from './docker/docker.module';
import { SeleniumModule } from './selenium/selenium.module';
import { HttpResponseModule } from './http/http.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './utils/utils.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GsmGatewayApiModule } from './gsm-gateway-api/gsm-gateway-api.module';
import { FreepbxApiModule } from './freepbx-api/freepbx-api.module';
import { MailModule } from './mail/mail.module';
import { SystemModule } from './system/system.module';
import { RedisModule } from './redis/redis.module';
import { AsteriskCdrModule } from './asterisk-cdr/asterisk-cdr.module';
import { AmocrmUsersModule } from './amocrm-users/amocrm-users.module';
import { AsteriskApiModule } from './asterisk-api/asterisk-api.module';
import { AmocrmModule } from './amocrm/amocrm.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const { username, password, database, host } =
          configService.get('mongo');

        return {
          uri: `mongodb://${username}:${password}@${host}/${database}`,
        };
      },
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
    GsmGatewayApiModule,
    FreepbxApiModule,
    MailModule,
    SystemModule,
    RedisModule,
    AsteriskCdrModule,
    AmocrmUsersModule,
    AsteriskApiModule,
    AmocrmModule,
  ],
  controllers: [],
  providers: [InitSystemConfig],
  exports: [ConfigModule],
})
export class AppModule {}
