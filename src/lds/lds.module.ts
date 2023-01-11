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
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': configService.get('userAgent'),
          Authorization: `Bearer ${configService.get('lds.bearer')}`,
          Cookie: configService.get('lds.cookie'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [Lds, LdsService, LdsSynchUserSchedule],
  exports: [LdsService],
})
export class LdsModule {}
