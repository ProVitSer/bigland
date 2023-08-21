import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Login } from './login';
import { By, WebDriver } from 'selenium-webdriver';
import { SetGeneralSetting, CreateUserResult, CreatePbxUserData } from '../interfaces/freepbx-api.interfaces';
import { FreepbxSubmitChange } from './submit-change';
import { LogService } from '@app/log/log.service';

@Injectable()
export class FreepbxCreateUser {
  private webDriver: WebDriver;
  constructor(
    private readonly login: Login,
    private readonly configService: ConfigService,
    private readonly submitChange: FreepbxSubmitChange,
    private readonly log: LogService,
  ) {}

  async createPbxUser(data: CreatePbxUserData): Promise<CreateUserResult> {
    try {
      return this.create(data);
    } catch (e) {
      this.log.error(e, FreepbxCreateUser.name);
      throw e;
    }
  }

  private async create(data: CreatePbxUserData): Promise<CreateUserResult> {
    try {
      this.webDriver = data.webDriver;
      await this.webDriver.get(
        `https://${this.configService.get('freepbx.domain')}/admin/config.php?display=extensions&tech_hardware=pjsip_generic`,
      );
      await this.webDriver.sleep(5000);
      const userSetting = await this.setGeneralSetting(data);

      await this.webDriver.sleep(5000);
      await this.setAdvancedSetting();

      await this.webDriver.sleep(5000);
      await this.submitChange.submit(this.webDriver);
      await this.webDriver.sleep(5000);

      return userSetting;
    } catch (e) {
      !!this.webDriver ? await this.webDriver.quit() : '';
      throw e;
    }
  }

  private async setAdvancedSetting(): Promise<void> {
    try {
      await this.webDriver.findElement(By.xpath(`//li[@data-name="advanced"]`)).click();
      await this.webDriver.sleep(1000);
      await this.webDriver.findElement(By.xpath("//option[@value='0.0.0.0-udp']")).click();
      await this.webDriver.findElement(By.xpath("//label[@for='devinfo_mwi_subscription1']")).click();
      await this.webDriver.findElement(By.xpath("//label[@for='devinfo_aggregate_mwi0']")).click();
      await this.webDriver.findElement(By.xpath("//label[@for='recording_in_external0']")).click();
      await this.webDriver.findElement(By.xpath("//label[@for='recording_out_external0']")).click();
      await this.webDriver.findElement(By.xpath("//label[@for='recording_in_internal0']")).click();
      await this.webDriver.findElement(By.xpath("//label[@for='recording_out_internal0']")).click();
      await this.webDriver.findElement(By.xpath("//label[@for='recording_ondemand1']")).click();
      await this.webDriver.findElement(By.xpath("//input[@value='Сохранить']")).click();
    } catch (e) {
      throw e;
    }
  }

  private async setGeneralSetting(data: CreatePbxUserData): Promise<SetGeneralSetting> {
    try {
      await this.webDriver.findElement(By.id('extension')).sendKeys(data.extension);
      await this.webDriver.findElement(By.id('name')).sendKeys(`${data.firstName} ${data.lastName}`);
      const password = await this.webDriver.findElement(By.id('devinfo_secret')).getAttribute('value');
      return {
        extension: data.extension,
        password,
      };
    } catch (e) {
      throw e;
    }
  }
}
