import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ProxyCallingController, ProxyCallingResultController, ProxyTtsController } from './proxy-calling-tts.controller';
import { HttpResponseModule } from '@app/http/http.module';
import { LogModule } from '@app/log/log.module';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { SystemModule } from '@app/system/system.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ProxyCallingTtsUtils } from './proxy-calling-tts.utils';

@Module({
  imports: [ConfigModule, LogModule, HttpResponseModule, SystemModule, HttpModule],
  controllers: [ProxyCallingController, ProxyTtsController, ProxyCallingResultController],
  providers: [ProxyCallingTtsUtils],
})
export class ProxyCallingTtsModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(ProxyCallingResultController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(ProxyCallingController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(ProxyTtsController);
  }
}
