import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import configuration from '@app/config/config.provider';
import * as cookieParser from 'cookie-parser';
import { WsAdapter } from '@nestjs/platform-ws';
import {
  HttpException,
  HttpStatus,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { LogEventType } from './log/interfaces/log.interfaces';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const config = new ConfigService(configuration());
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((error) => {
          if (!!error.constraints) {
            return {
              field: error.property,
              error: error.constraints,
            };
          } else if (
            Array.isArray(error.children) &&
            error.children.length > 0
          ) {
            return formatError(error);
          }
        });
        return new HttpException(
          {
            message: messages.length > 1 ? messages : messages[0],
            logEventType: LogEventType.data_error,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );
  app.setGlobalPrefix('api/v2');

  const docConfig = new DocumentBuilder()
    .setTitle('VPNP VoIP API')
    .setDescription('API for VoIP integration')
    .setVersion('2.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api', app, document);
  await app.listen(config.get('appPort'));
}

function formatError(
  error: ValidationError,
): Array<{ field: string; error: { [type: string]: string } }> {
  const message: Array<{ field: string; error: { [type: string]: string } }> =
    [];

  function getChildren(childrenError: ValidationError, prop: string) {
    if (
      Array.isArray(childrenError.children) &&
      childrenError.children.length != 0
    ) {
      for (let i = 0; i < childrenError.children.length; i++) {
        getChildren(
          childrenError.children[i],
          `${prop}.${childrenError.children[i].property}`,
        );
      }
    }
    !!childrenError.constraints
      ? message.push({ field: prop, error: childrenError.constraints })
      : '';
  }

  getChildren(error, error.property);

  return message;
}

bootstrap();
