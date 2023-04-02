import { Module } from '@nestjs/common';
import { CdrService } from './cdr.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CdrMessagingService } from './cdr.subscribers';
import { MongooseModule } from '@nestjs/mongoose';
import { Cdr, CdrSchema } from './cdr.schema';
import { LogModule } from '@app/log/log.module';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { AmocrmModule } from '@app/amocrm/amocrm.module';
import { AmocrmUsersModule } from '@app/amocrm-users/amocrm-users.module';
import { getRabbitMQConfig } from '@app/config/project-configs/rabbit.config';
import { ScheduleModule } from '@nestjs/schedule';
import { CdrSchedule } from './schedule/cdr.schedule';
import { Amocrm, AmocrmSchema } from '@app/amocrm/amocrm.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LogModule,
    AsteriskCdrModule,
    AmocrmModule,
    AmocrmUsersModule,
    MongooseModule.forFeature([
      { name: Cdr.name, schema: CdrSchema },
      { name: Amocrm.name, schema: AmocrmSchema },
    ]),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: getRabbitMQConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [CdrService, CdrMessagingService, CdrSchedule],
})
export class CdrModule {}
