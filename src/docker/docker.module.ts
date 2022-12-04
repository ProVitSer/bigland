import * as Docker from 'dockerode';
import { DockerService } from './docker.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogModule } from '@app/log/log.module';

const providers = [
  DockerService,
  {
    provide: 'DOCKER_SERVICE',
    useFactory: (configService: ConfigService) => {
      return new Docker({
        host: configService.get('docker.host'),
        port: configService.get('docker.port'),
      });
    },
    inject: [ConfigService],
  },
];

@Module({
  providers,
  imports: [ConfigModule, LogModule],
  exports: [...providers],
})
export class DockerModule {}
