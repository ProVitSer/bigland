import { GsmPortsActionService, GsmUSSDActionService } from '@app/gsm-gateway-api/gsm/gsm-action-service';
import { GsmPortFormatInfo, GsmUSSDInfo, OperatoBalanceCodeMap } from '@app/gsm-gateway-api/interfaces/gsm-gateway-api.interfaces';
import { LogService } from '@app/log/log.service';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BALANCE_ERROR, CHANSPY_UPDATE_ERROR } from '../system.constants';
import { GsmGateway } from '../system.schema';
import { SystemService } from '../system.service';

@Injectable()
export class UpdateSystemConfigSchedule {
  constructor(
    private readonly log: LogService,
    private readonly systemService: SystemService,
    private readonly gsmPorts: GsmPortsActionService,
    private readonly ussd: GsmUSSDActionService,
  ) {}

  //@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
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

  //@Cron(CronExpression.EVERY_DAY_AT_7AM)
  async updateGsmGatewayBalance() {
    try {
      const gsmGatewayInfo = [];
      const gsmPorts = await this.gsmPorts.getActiveGsmPorts();
      await Promise.all(
        gsmPorts.map(async (port: string) => {
          const portInfo = (await this.gsmPorts.getPortInfo(port, true)) as GsmPortFormatInfo;
          const ussdRequset: GsmUSSDInfo = {
            gsmPort: port,
            ussdRequest: OperatoBalanceCodeMap[portInfo.operator],
          };
          const portBalace = await this.ussd.sendUSSD(ussdRequset);
          gsmGatewayInfo.push({
            port,
            balance: portBalace,
          });
          return await this.updateBalance(gsmGatewayInfo);
        }),
      );
    } catch (e) {
      this.log.error(`${BALANCE_ERROR} ${e}`, UpdateSystemConfigSchedule.name);
    }
  }

  private async updateBalance(gsmGatewayInfo: GsmGateway[]) {
    try {
      return await Promise.all(
        gsmGatewayInfo.map(async (portInfo: GsmGateway) => {
          await this.systemService.updateGsmGatewayConfig(portInfo);
        }),
      );
    } catch (e) {
      throw e;
    }
  }
}
