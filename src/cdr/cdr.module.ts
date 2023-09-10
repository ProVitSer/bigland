import { Module } from '@nestjs/common';
import { CdrService } from './cdr.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cdr, CdrSchema } from './cdr.schema';
import { LogModule } from '@app/log/log.module';
import { AsteriskCdrModule } from '@app/asterisk-cdr/asterisk-cdr.module';
import { AmocrmModule } from '@app/amocrm/amocrm.module';
import { AmocrmUsersModule } from '@app/amocrm-users/amocrm-users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CdrSchedule } from './schedule/cdr.schedule';
import { CdrMessagingSubService } from './cdr-mq/cdr-messaging-sub.service';
import { RabbitModule } from '@app/rabbit/rabbit.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LogModule,
    AsteriskCdrModule,
    AmocrmModule,
    AmocrmUsersModule,
    MongooseModule.forFeature([{ name: Cdr.name, schema: CdrSchema }]),
    RabbitModule,
  ],
  providers: [CdrService, CdrMessagingSubService, CdrSchedule],
})
export class CdrModule {}
