import { AuthModule } from '@app/auth/auth.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpResponseModule } from '@app/http/http.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { LogModule } from '@app/log/log.module';
import { SystemModule } from '@app/system/system.module';
import { OperatorsModule } from '@app/operators/operators.module';
import { AmocrmApiController, CallApiController, ChanspyApiController, ServiceCodeApiController } from './controllers';
import { AmocrmApiService, CallApiService, ChanspyApiService, ServiceCodeApiService } from './services';
import { AmiModule } from '@app/asterisk/ami/ami.module';
import { AriModule } from '@app/asterisk/ari/ari.module';

@Module({
  imports: [ConfigModule, LogModule, AmiModule, AriModule, AuthModule, HttpResponseModule, SystemModule, OperatorsModule],
  controllers: [CallApiController, AmocrmApiController, ServiceCodeApiController, ChanspyApiController],
  providers: [CallApiService, AmocrmApiService, ServiceCodeApiService, ChanspyApiService],
  exports: [],
})
export class AsteriskApiModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(AmocrmApiController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(CallApiController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(ServiceCodeApiController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(ChanspyApiController);
  }
}
