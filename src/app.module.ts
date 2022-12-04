import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogModule } from './log/log.module';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';
import { CdrModule } from './cdr/cdr.module';
import { DatabaseModule } from './database/database.module';
import { LdsModule } from './lds/lds.module';
import configuration from './config/config.provider';
import { DockerModule } from './docker/docker.module';
import { SeleniumModule } from './selenium/selenium.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    LogModule,
    TelegramModule,
    CdrModule,
    DatabaseModule,
    LdsModule,
    DockerModule,
    SeleniumModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [ConfigModule],
})
export class AppModule {}
