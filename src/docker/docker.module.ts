import { DockerService } from './docker.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LogModule } from '@app/log/log.module';
import { createDocker } from '@app/config/project-configs/docker.config';

const dockerProviders = createDocker();

const providers = [DockerService, ...dockerProviders];

@Module({
  providers,
  imports: [ConfigModule, LogModule],
  exports: [...providers],
})
export class DockerModule {}
