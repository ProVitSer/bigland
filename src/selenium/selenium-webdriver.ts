import { DockerService } from '@app/docker/docker.service';
import { LogService } from '@app/log/log.service';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Builder, WebDriver } from 'selenium-webdriver';
import { Capabilities } from './interfaces/selenium.interfaces';
import { SeleniumEnvironmentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class SeleniumWebdriver implements OnApplicationBootstrap {
    private capabilities: Capabilities;
    private readonly seleniumDockerImg: string;
    private seleniumConfig = this.configService.get<SeleniumEnvironmentVariables>('selenium');

    constructor(private readonly configService: ConfigService, private readonly log: LogService, private readonly docker: DockerService) {

        this.capabilities = this.seleniumConfig.capabilities;
        this.seleniumDockerImg = this.seleniumConfig.selenoidDockerImg;

    }

    async onApplicationBootstrap() {
        try {

            await this.docker.checkImgUp(this.seleniumDockerImg);

        } catch (e) {

            this.log.error(e, SeleniumWebdriver.name);

        }
    }

    public async getWebDriver(): Promise<WebDriver> {
        try {

            return await new Builder().usingServer(this.seleniumConfig.host).withCapabilities(this.capabilities).build();

        } catch (e) {

            throw e;
            
        }
    }
}