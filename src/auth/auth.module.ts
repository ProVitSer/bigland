import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthTokenService, AuthUserService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { HttpResponseModule } from '@app/http/http.module';
import { JwtStrategy, LocalStrategy } from './strategy';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { LogModule } from '@app/log/log.module';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [
    ConfigModule,
    LogModule,
    PassportModule,
    HttpResponseModule,
    JwtModule.register({}),
    UsersModule,
  ],
  providers: [AuthTokenService, AuthUserService, LocalStrategy, JwtStrategy],
  exports: [AuthTokenService, AuthUserService],
  controllers: [AuthController],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware, AllowedIpMiddleware)
      .forRoutes(AuthController);
  }
}
