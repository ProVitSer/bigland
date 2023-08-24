import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { HttpResponseModule } from '@app/http/http.module';
import { JwtStrategy, LocalStrategy } from './strategy';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { LogModule } from '@app/log/log.module';
import { UsersModule } from '@app/users/users.module';
import { AuthUserService } from './services/auth-user.service';
import { AuthTokenService } from './services/auth-token.service';

@Module({
  imports: [ConfigModule, LogModule, PassportModule, HttpResponseModule, JwtModule.register({}), UsersModule],
  providers: [AuthTokenService, AuthUserService, LocalStrategy, JwtStrategy],
  exports: [AuthTokenService, AuthUserService],
  controllers: [AuthController],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware, AllowedIpMiddleware).forRoutes(AuthController);
  }
}
