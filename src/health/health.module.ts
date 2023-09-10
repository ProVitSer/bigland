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
import { RedisModule } from '@app/redis/redis.module';
import {
  DockerImgServiceHealthIndicator,
  DockerServiceHealthIndicator,
  RedisHealthIndicator,
  AsteriskAriApplicationHealthIndicator,
  AsteriskHealthIndicator,
  AmocrmHealthIndicator,
} from './health-indicators';
import { AmocrmModule } from '@app/amocrm/amocrm.module';
import { AmiModule } from '@app/asterisk/ami/ami.module';
import { AriModule } from '@app/asterisk/ari/ari.module';

@Module({
  imports: [
    TerminusModule,
    ScheduleModule.forRoot(),
    ConfigModule,
    LogModule,
    DockerModule,
    MailModule,
    HttpResponseModule,
    AmiModule,
    AriModule,
    RedisModule,
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
