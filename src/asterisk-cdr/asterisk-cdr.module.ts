import { Module } from '@nestjs/common';
import { Cdr } from './asterisk-cdr.entity';
import { AsteriskCdrService } from './asterisk-cdr.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { LogModule } from '@app/log/log.module';

@Module({
  imports: [
    LogModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mariadb',
        host: configService.get('mariadb.host'),
        port: configService.get('mariadb.port'),
        username: configService.get('mariadb.username'),
        password: configService.get('mariadb.password'),
        database: configService.get('mariadb.databases'),
        autoLoadModels: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([Cdr]),
  ],
  providers: [AsteriskCdrService],
  exports: [AsteriskCdrService],
})
export class AsteriskCdrModule {}
