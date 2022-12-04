import { MiddlewareConsumer, Module } from '@nestjs/common';
import { FreepbxUsersApiService } from './freepbx-api-users.service';
import { FreepbxApiController } from './freepbx-api.controller';
import { SeleniumModule } from '@app/selenium/selenium.module';
import { ConfigModule } from '@nestjs/config';
import { HttpResponseModule } from '@app/http/http.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { Login } from './selenium/login';
import { FreepbxCreateUser } from './selenium/create-user';
import { FreepbxSubmitChange } from './selenium/submit-change';
import { MailModule } from '@app/mail/mail.module';
import { LogModule } from '@app/log/log.module';
import { MongooseModule } from '@nestjs/mongoose';
import { FreepbxApi, FreepbxApiSchema } from './freepbx-api.schema';
import { SystemModule } from '@app/system/system.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FreepbxApi.name, schema: FreepbxApiSchema },
    ]),
    ConfigModule,
    LogModule,
    HttpResponseModule,
    SeleniumModule,
    MailModule,
    SystemModule,
  ],
  providers: [
    FreepbxUsersApiService,
    Login,
    FreepbxCreateUser,
    FreepbxSubmitChange,
  ],
  controllers: [FreepbxApiController],
})
export class FreepbxApiModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(FreepbxApiController);
  }
}