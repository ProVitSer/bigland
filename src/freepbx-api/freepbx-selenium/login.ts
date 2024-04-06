import { FreepbxEnvironmentVariables } from '@app/config/interfaces/config.interface';
import { LogService } from '@app/log/log.service';
import { SeleniumWebdriver } from '@app/selenium/selenium-webdriver';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { By, WebDriver } from 'selenium-webdriver';

@Injectable()
export class Login {
    private webDriver: WebDriver;
    private freepbxConfig = this.configService.get<FreepbxEnvironmentVariables>('freepbx');

    constructor(
        private readonly seleniumWebDriver: SeleniumWebdriver,
        private readonly configService: ConfigService,
        private readonly log: LogService,
    ) {}

    public async loginOnPbx(): Promise<WebDriver> {
        try {

            return await this._login();
            
        } catch (e) {

            this.log.error(e, Login.name);

            throw e;

        }

    }

    private async _login(): Promise<WebDriver> {
        try {

            this.webDriver = await this.seleniumWebDriver.getWebDriver();

            return await this.authorization();

        } catch (e) {

            throw e;

        }
    }

    private async authorization(): Promise<WebDriver> {
        try {

            await this.webDriver.get(`https://${this.freepbxConfig.domain}/admin`);

            await this.webDriver.manage().window().maximize();

            await this.webDriver.sleep(20000);
            
            await this.webDriver.findElement(By.id('login_admin')).click();

            await this.webDriver.findElement(By.xpath('/html/body/div[15]/div[2]/form/div[1]/input')).sendKeys(this.freepbxConfig.username);

            await this.webDriver.findElement(By.xpath('/html/body/div[15]/div[2]/form/div[2]/input')).sendKeys(this.freepbxConfig.password);

            await this.webDriver.findElement(By.xpath(`//*[contains(text(), 'Перегрузка')]`)).click();

            await this.webDriver.sleep(5000);

            return this.webDriver;

        } catch (e) {

            !!this.webDriver ? await this.webDriver.quit() : '';

            throw e;
            
        }
    }
}