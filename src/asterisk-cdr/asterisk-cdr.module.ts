import { Module } from '@nestjs/common';
import { AsteriskCdr } from './asterisk-cdr.entity';
import { AsteriskCdrService } from './asterisk-cdr.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { LogModule } from '@app/log/log.module';
import { getMariadbUseFactory } from '@app/config/project-configs//mariadb.config';

@Module({
  imports: [
    LogModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMariadbUseFactory,
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([AsteriskCdr]),
  ],
  providers: [AsteriskCdrService],
  exports: [AsteriskCdrService],
})
export class AsteriskCdrModule {}
