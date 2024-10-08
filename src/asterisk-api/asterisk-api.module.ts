import { AuthModule } from '@app/auth/auth.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpResponseModule } from '@app/http/http.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { LogModule } from '@app/log/log.module';
import { SystemModule } from '@app/system/system.module';
import { OperatorsModule } from '@app/operators/operators.module';
import {
  AmocrmApiController,
  BlackListyApiController,
  CallApiController,
  ChanspyApiController,
  ServiceCodeApiController,
} from './controllers';
import { AmocrmApiService, BlackListNumbersService, CallApiService, ChanspyApiService, ServiceCodeApiService } from './services';
import { AmiModule } from '@app/asterisk/ami/ami.module';
import { AriModule } from '@app/asterisk/ari/ari.module';
import { ExtensionsStateService } from './services/extensions-state.service';
import { RateLimiterModule } from 'nestjs-rate-limiter';
import { MAX_REMOTE_DURATION, MAX_REMOTE_POINTS, RATELIMIT_REQUEST_ERROR } from '@app/config/project-configs/rate-ilmite.config';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        ConfigModule, 
        LogModule, 
        AmiModule, 
        AriModule, 
        AuthModule, 
        HttpResponseModule, 
        SystemModule, 
        OperatorsModule,
        RateLimiterModule.register({
            duration: MAX_REMOTE_DURATION,
            points: MAX_REMOTE_POINTS,
            errorMessage: RATELIMIT_REQUEST_ERROR,
          }),
        AsteriskCdrModule,
        HttpModule
    ],
    controllers: [CallApiController, AmocrmApiController, ServiceCodeApiController, ChanspyApiController, BlackListyApiController],
    providers: [CallApiService, AmocrmApiService, ServiceCodeApiService, ChanspyApiService, BlackListNumbersService, ExtensionsStateService],
    exports: [],
})
export class AsteriskApiModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes(AmocrmApiController)
            .apply(LoggerMiddleware, AllowedIpMiddleware)
            .forRoutes(CallApiController)
            .apply(AllowedIpMiddleware)
            .forRoutes(ServiceCodeApiController)
            .apply(LoggerMiddleware, AllowedIpMiddleware)
            .forRoutes(ChanspyApiController)
            .apply(LoggerMiddleware, AllowedIpMiddleware)
            .forRoutes(BlackListyApiController)
    }
}