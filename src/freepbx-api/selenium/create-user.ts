import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Login } from './login';
import { By, WebDriver } from 'selenium-webdriver';
import { Users } from '../dto/create-users.dto';
import {
  SetGeneralSetting,
  CreateUserResult,
} from '../interfaces/freepbx-api.interfaces';
import { FreepbxSubmitChange } from './submit-change';
import { LogService } from '@app/log/log.service';
import { SystemService } from '@app/system/system.service';

@Injectable()
export class FreepbxCreateUser {
  private webDriver: WebDriver;
  constructor(
    private readonly login: Login,
    private readonly configService: ConfigService,
    private readonly systemService: SystemService,
    private readonly submitChange: FreepbxSubmitChange,
    private readonly log: LogService,
  ) {}

  async createPbxUser(data: Users): Promise<CreateUserResult> {
    try {
      return this.create(data);
    } catch (e) {
      throw e;
    }
  }

  private async create(data: Users): Promise<CreateUserResult> {
    try {
      this.webDriver = await this.login.loginOnPbx();
      await this.webDriver.get(
        `https://${this.configService.get(
          'freepbx.domain',
        )}/admin/config.php?display=extensions&tech_hardware=pjsip_generic`,
      );
      await this.webDriver.sleep(5000);
      const userSetting = await this.setGeneralSetting(data.username);
      await this.setAdvancedSetting();
      await this.submitChange.submit(this.webDriver);
      return userSetting;
    } catch (e) {
      !!this.webDriver ? await this.webDriver.quit() : '';
      throw e;
    }
  }

  private async setAdvancedSetting(): Promise<void> {
    try {
      await this.webDriver
        .findElement(By.xpath(`//li[@data-name="advanced"]`))
        .click();
      await this.webDriver.sleep(1000);
      await this.webDriver
        .findElement(By.xpath("//option[@value='0.0.0.0-udp']"))
        .click();
      await this.webDriver
        .findElement(By.xpath("//label[@for='devinfo_mwi_subscription1']"))
        .click();
      await this.webDriver
        .findElement(By.xpath("//label[@for='devinfo_aggregate_mwi0']"))
        .click();
      await this.webDriver
        .findElement(By.xpath("//label[@for='recording_in_external0']"))
        .click();
      await this.webDriver
        .findElement(By.xpath("//label[@for='recording_out_external0']"))
        .click();
      await this.webDriver
        .findElement(By.xpath("//label[@for='recording_in_internal0']"))
        .click();
      await this.webDriver
        .findElement(By.xpath("//label[@for='recording_out_internal0']"))
        .click();
      await this.webDriver
        .findElement(By.xpath("//label[@for='recording_ondemand1']"))
        .click();
      await this.webDriver
        .findElement(By.xpath("//input[@value='Сохранить']"))
        .click();
    } catch (e) {
      this.log.error(e, FreepbxCreateUser.name);
      throw new Error('Ошибка занесение данных в расширенных настройках');
    }
  }

  private async setGeneralSetting(
    username: string,
  ): Promise<SetGeneralSetting> {
    try {
      const extension = await this.getAvaliableExtension();
      await this.webDriver
        .findElement(By.id('extension'))
        .sendKeys(String(extension));
      await this.webDriver.findElement(By.id('name')).sendKeys(username);
      const password = await this.webDriver
        .findElement(By.id('devinfo_secret'))
        .getAttribute('value');
      return {
        extension,
        password,
      };
    } catch (e) {
      this.log.error(e, FreepbxCreateUser.name);
      throw new Error('Ошибка занесение данных в основных настройках');
    }
  }

  private async getAvaliableExtension() {
    try {
      const extensions = (await this.systemService.getConfig())
        .freepbxAvailableExtension;
      return extensions[0];
    } catch (e) {
      throw e;
    }
  }
}
