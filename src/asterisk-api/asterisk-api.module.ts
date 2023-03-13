import { AsteriskModule } from '@app/asterisk/asterisk.module';
import { AuthModule } from '@app/auth/auth.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CallApiController } from './controllers/call-api.controller';
import { CallApiService } from './services/call-api.service';
import { HttpResponseModule } from '@app/http/http.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AmocrmApiController } from './controllers/amocrm-api.controller';
import { AmocrmApiService } from './services/amocrm-api.service';
import { ServiceCodeApiController } from './controllers/service-code-api.controller';
import { ServiceCodeApiService } from './services/service-code-api.service';
import { ChanspyApiController } from './controllers/chanspy-api.controller';
import { ChanspyApiService } from './services/chanspy-api.service';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { LogModule } from '@app/log/log.module';
import { SystemModule } from '@app/system/system.module';

@Module({
  imports: [ConfigModule, LogModule, AsteriskModule, AuthModule, HttpResponseModule, SystemModule],
  controllers: [CallApiController, AmocrmApiController, ServiceCodeApiController, ChanspyApiController],
  providers: [CallApiService, AmocrmApiService, ServiceCodeApiService, ChanspyApiService],
})
export class AsteriskApiModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(AmocrmApiController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(ChanspyApiController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(CallApiController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(ServiceCodeApiController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(ChanspyApiController);
  }
}
