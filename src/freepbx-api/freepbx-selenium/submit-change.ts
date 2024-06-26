import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { By, WebDriver } from 'selenium-webdriver';

@Injectable()
export class FreepbxSubmitChange {
    private webDriver: WebDriver;
    constructor(private readonly log: LogService) {}

    public async submit(webDriver: WebDriver): Promise<void> {
        try {

            this.webDriver = webDriver;

            return await this.submitChange();

        } catch (e) {

            this.log.error(e, FreepbxSubmitChange.name);

            throw e;

        }
    }

    private async submitChange(): Promise<void> {
        try {

            await this.webDriver.findElement(By.xpath("//a[@id='button_reload']")).click();

            await this.webDriver.sleep(30000);

            await this.webDriver.quit();

        } catch (e) {
            
            throw e;

        }
    }
}