import { forwardRef, Module } from '@nestjs/common';
import { System, SystemSchema } from './system.schema';
import { SystemService } from './system.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UpdateSystemConfigSchedule } from './schedule/update-system-config-schedule';
import { ScheduleModule } from '@nestjs/schedule';
import { LogModule } from '@app/log/log.module';
import { GsmGatewayApiModule } from '@app/gsm-gateway-api/gsm-gateway-api.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LogModule,
    forwardRef(() => GsmGatewayApiModule),
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
  ],
  providers: [SystemService, System, UpdateSystemConfigSchedule],
  exports: [System, SystemService],
})
export class SystemModule {}
