import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitPubService } from './rabbit.service';
import { getRabbitMQConfig } from '@app/config/project-configs/rabbit.config';

@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: getRabbitMQConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [RabbitPubService],
  exports: [RabbitPubService],
})
export class RabbitModule {}
