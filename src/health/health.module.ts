import { MiddlewareConsumer, Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { LogModule } from '@app/log/log.module';
import { DockerModule } from '@app/docker/docker.module';
import { MailModule } from '@app/mail/mail.module';
import { HttpResponseModule } from '@app/http/http.module';
import { HealthScheduledService } from './schedule/health-service.schedule';
import { ScheduleModule } from '@nestjs/schedule';
import { AsteriskModule } from '@app/asterisk/asterisk.module';
import { RedisModule } from '@app/redis/redis.module';
import {
  DockerImgServiceHealthIndicator,
  DockerServiceHealthIndicator,
  RedisHealthIndicator,
  AsteriskAriApplicationHealthIndicator,
  AsteriskHealthIndicator,
  GsmGatewayHealthIndicator,
  AmocrmHealthIndicator,
} from './health-indicators';
import { GsmGatewayApiModule } from '@app/gsm-gateway-api/gsm-gateway-api.module';
import { AmocrmModule } from '@app/amocrm/amocrm.module';

@Module({
  imports: [
    TerminusModule,
    ScheduleModule.forRoot(),
    ConfigModule,
    LogModule,
    DockerModule,
    MailModule,
    HttpResponseModule,
    AsteriskModule,
    RedisModule,
    GsmGatewayApiModule,
    AmocrmModule,
  ],
  providers: [
    HealthService,
    HealthScheduledService,
    DockerServiceHealthIndicator,
    DockerImgServiceHealthIndicator,
    AsteriskHealthIndicator,
    AsteriskAriApplicationHealthIndicator,
    RedisHealthIndicator,
    GsmGatewayHealthIndicator,
    AmocrmHealthIndicator,
  ],
  controllers: [HealthController],
  exports: [HealthService],
})
export class HealthModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes(HealthController);
  }
}