import { MiddlewareConsumer, Module } from '@nestjs/common';
import { FreepbxUsersApiService } from './freepbx-api-users.service';
import { FreepbxApiController } from './freepbx-api.controller';
import { SeleniumModule } from '@app/selenium/selenium.module';
import { ConfigModule } from '@nestjs/config';
import { HttpResponseModule } from '@app/http/http.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { Login } from './freepbx-selenium/login';
import { FreepbxCreateUser } from './freepbx-selenium/create-user';
import { FreepbxSubmitChange } from './freepbx-selenium/submit-change';
import { MailModule } from '@app/mail/mail.module';
import { LogModule } from '@app/log/log.module';
import { SystemModule } from '@app/system/system.module';
import { PbxCallRoutingModule } from '@app/pbx-call-routing/pbx-call-routing.module';
import { TelegramModule } from '@app/telegram/telegram.module';

@Module({
  imports: [ConfigModule, LogModule, HttpResponseModule, SeleniumModule, MailModule, SystemModule, PbxCallRoutingModule, TelegramModule],
  providers: [FreepbxUsersApiService, Login, FreepbxCreateUser, FreepbxSubmitChange],
  controllers: [FreepbxApiController],
})
export class FreepbxApiModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware, AllowedIpMiddleware).forRoutes(FreepbxApiController);
  }
}
