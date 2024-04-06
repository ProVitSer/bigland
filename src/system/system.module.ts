import { Module } from '@nestjs/common';
import { System, SystemSchema } from './system.schema';
import { SystemService } from './system.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { LogModule } from '@app/log/log.module';

@Module({
    imports: [ScheduleModule.forRoot(), LogModule, MongooseModule.forFeature([{
        name: System.name,
        schema: SystemSchema
    }])],
    providers: [SystemService, System],
    exports: [System, SystemService],
})
export class SystemModule {}