import { AsteriskModule } from '@app/asterisk/asterisk.module';
import { AuthModule } from '@app/auth/auth.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpResponseModule } from '@app/http/http.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { LogModule } from '@app/log/log.module';
import { SystemModule } from '@app/system/system.module';
import { OperatorsModule } from '@app/operators/operators.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AsterikkApi, AsterikkApiSchema } from './asterisk-api.schema';
import {
  AmocrmApiController,
  AsteriskApiApiController,
  CallApiController,
  ChanspyApiController,
  ServiceCodeApiController,
} from './controllers';
import {
  AmocrmApiService,
  CallApiService,
  ChanspyApiService,
  ServiceCodeApiService,
  AsteriskApiModelService,
  AsteriskApiService,
} from './services';
import { SpamApiController } from './controllers/spam.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: AsterikkApi.name, schema: AsterikkApiSchema }]),
    LogModule,
    AsteriskModule,
    AuthModule,
    HttpResponseModule,
    SystemModule,
    OperatorsModule,
  ],
  controllers: [
    CallApiController,
    AmocrmApiController,
    ServiceCodeApiController,
    ChanspyApiController,
    AsteriskApiApiController,
    SpamApiController,
  ],
  providers: [AsteriskApiService, AsteriskApiModelService, CallApiService, AmocrmApiService, ServiceCodeApiService, ChanspyApiService],
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
      .forRoutes(ChanspyApiController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(AsteriskApiApiController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(SpamApiController);
  }
}
