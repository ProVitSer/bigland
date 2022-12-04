import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LdsService } from './lds.service';
import { HttpModule } from '@nestjs/axios';
import { LogModule } from '@app/log/log.module';
import { LdsSynchUserSchedule } from './schedule/lds-synch-user.schedule';
import { Lds, LdsSchema } from './lds.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule,
    LogModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: Lds.name, schema: LdsSchema }]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'User-Agent': 'Backend/1.0.2',
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [Lds, LdsService, LdsSynchUserSchedule],
})
export class LdsModule {}
