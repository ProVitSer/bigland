import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DockerModule } from '@app/docker/docker.module';
import { SeleniumWebdriver } from './selenium-webdriver';
import { LogModule } from '@app/log/log.module';

@Module({
    imports: [ConfigModule, LogModule, DockerModule],
    providers: [SeleniumWebdriver],
    exports: [SeleniumWebdriver],
})
export class SeleniumModule {}