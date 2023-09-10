import { LogService } from '@app/log/log.service';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { CHANSPY_UPDATE_ERROR } from '../system.constants';
import { SystemService } from '../system.service';

@Injectable()
export class UpdateSystemConfigSchedule {
  constructor(private readonly log: LogService, private readonly systemService: SystemService) {}

  async updateChanSpyPassword() {
    try {
      const newPassword = UtilsService.generateRandomNumber(4);
      await this.updateChanSpy(newPassword);
    } catch (e) {
      this.log.error(`${CHANSPY_UPDATE_ERROR} ${e}`, UpdateSystemConfigSchedule.name);
    }
  }

  private async updateChanSpy(password: string): Promise<void> {
    const actuialConfig = await this.systemService.getConfig();
    if (!!actuialConfig[0]._id) {
      await this.systemService.updateChanSpyPassword(actuialConfig[0]._id, password);
    } else {
      await this.systemService.addNewChanSpyPassword(password);
    }
  }
}
