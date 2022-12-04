import { forwardRef, Module } from '@nestjs/common';
import { System, SystemSchema } from './system.schema';
import { SystemService } from './system.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@app/redis/redis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SystemUpdateListener } from './system.listener';
import { UpdateSystemConfigSchedule } from './update-system-config-schedule';
import { ScheduleModule } from '@nestjs/schedule';
import { LogModule } from '@app/log/log.module';
import { GsmGatewayApiModule } from '@app/gsm-gateway-api/gsm-gateway-api.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    RedisModule,
    LogModule,
    forwardRef(() => GsmGatewayApiModule),
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
  ],
  providers: [
    SystemService,
    System,
    SystemUpdateListener,
    UpdateSystemConfigSchedule,
  ],
  exports: [System, SystemService],
})
export class SystemModule {}
