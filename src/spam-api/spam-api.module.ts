import { MiddlewareConsumer, Module } from '@nestjs/common';
import { SpamApiService, SpamModelService } from './spam-api.service';
import { SpamApiController } from './controllers/spam-api.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LogModule } from '@app/log/log.module';
import { AsteriskModule } from '@app/asterisk/asterisk.module';
import { AuthModule } from '@app/auth/auth.module';
import { HttpResponseModule } from '@app/http/http.module';
import { SystemModule } from '@app/system/system.module';
import { OperatorsModule } from '@app/operators/operators.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { BiglandModule } from '@app/bigland/bigland.module';
import { Spam, SpamSchema } from './spam.schema';
import { SpamResultController } from './controllers/spam-result.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Spam.name, schema: SpamSchema }]),
    LogModule,
    AsteriskModule,
    AuthModule,
    HttpResponseModule,
    SystemModule,
    OperatorsModule,
    BiglandModule,
  ],
  providers: [SpamApiService, SpamModelService],
  controllers: [SpamApiController, SpamResultController],
  exports: [SpamApiService],
})
export class SpamApiModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(SpamApiController)
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(SpamResultController);
  }
}
