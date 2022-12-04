import { DockerService } from '@app/docker/docker.service';
import { LogService } from '@app/log/log.service';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Builder } from 'selenium-webdriver';
import { Capabilities } from './interfaces/selenium.interfaces';

@Injectable()
export class SeleniumWebdriver implements OnApplicationBootstrap {
  private capabilities: Capabilities;
  private readonly seleniumDockerImg: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly docker: DockerService,
  ) {
    this.capabilities = this.configService.get('selenium.capabilities');
    this.seleniumDockerImg = this.configService.get(
      'selenium.selenoidDockerImg',
    );
  }

  async onApplicationBootstrap() {
    try {
      await this.docker.checkImgUp(this.seleniumDockerImg);
    } catch (e) {
      this.log.error(e, SeleniumWebdriver.name);
    }
  }

  public async getWebDriver() {
    try {
      console.log(this.capabilities);
      return await new Builder()
        .usingServer(this.configService.get('selenium.host'))
        .withCapabilities(this.capabilities)
        .build();
    } catch (e) {
      throw e;
    }
  }
}
