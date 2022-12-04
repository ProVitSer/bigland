import { Module } from '@nestjs/common';
import { System, SystemSchema } from './system.schema';
import { SystemService } from './system.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
  ],
  providers: [SystemService, System],
  exports: [System, SystemService],
})
export class SystemModule {}
