import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import configuration from '@app/config/config.provider';
import * as cookieParser from 'cookie-parser';
import { WsAdapter } from '@nestjs/platform-ws';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import httpsConfig from './https.provider';
import { GlobalValidationPipe } from './pipes/global-validation.pipe';

async function bootstrap() {
  const config = new ConfigService(configuration());
  const httpsOptions = httpsConfig(config);
  const app = await NestFactory.create(AppModule, {
    ...(httpsOptions ? { httpsOptions } : {}),
  });
  app.useWebSocketAdapter(new WsAdapter(app));
  app.use(cookieParser());
  app.useGlobalPipes(new GlobalValidationPipe());
  app.setGlobalPrefix(config.get('apiPrefix'));

  const docConfig = new DocumentBuilder()
    .setTitle('VPNP VoIP API')
    .setDescription('API for VoIP integration')
    .setVersion('2.1')
    .addBearerAuth({ in: 'header', type: 'http' })
    .build();
  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api/voip', app, document);
  await app.listen(config.get('appPort'));
}

bootstrap();
