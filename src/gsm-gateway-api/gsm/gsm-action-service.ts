import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { GsmGateway } from '../gsm-gateway';
import {
  GetGsmPortInfoEvent,
  GetGsmPortsInfoEvent,
  GsmPortFormatInfo,
  GsmPortsFormatInfo,
  GsmUSSDInfo,
  OperatoBalanceCodeMap,
  OperatoGetNumberCodeMap,
  ScheduledSMSData,
  SendScheduledSMSInfo,
  SendSMSInfo,
  SMSData,
} from '../interfaces/gsm-gateway-api.interfaces';
import * as namiLib from 'nami';
import { ConfigService } from '@nestjs/config';
import { Operators, SmsStatusDescription, SmsType } from '../interfaces/gsm-gateway-api.enum';
import {
  GSM_PORT_D_CHANEL_PARSE_IS_ACTIVE,
  GSM_PORT_D_CHANEL_PARSE_OPERATOR,
  GSM_PORT_D_CHANEL_PARSE_STATUS,
  USSD_DEFAULT_TIMEOUT,
} from '../gsm-gateway-api.config';
import { SendSMSScheduledTime } from '../dto/sms.dto';
import { SmsService } from '../sms/sms.service';
import { LogService } from '@app/log/log.service';
import { SystemService } from '@app/system/system.service';
import { ERROR_UNACTIVE_PORT } from './gsm.constants';

@Injectable()
export class GsmUSSDActionService {
  constructor(private readonly gsmGateway: GsmGateway, private readonly log: LogService) {}

  public async sendUSSD(data: GsmUSSDInfo): Promise<string> {
    try {
      const { gsmPort, ussdRequest } = data;
      const action = new namiLib.Actions.Smscommand();
      action.command = `gsm send ussd ${gsmPort} "${ussdRequest}" ${USSD_DEFAULT_TIMEOUT}`;

      const result = await this.gsmGateway.gmsClientSend(action);
      return result as string;
    } catch (e) {
      this.log.error(e, GsmUSSDActionService.name);
      throw e;
    }
  }
}

@Injectable()
export class GsmPortsActionService {
  constructor(
    private readonly gsmGateway: GsmGateway,
    private readonly system: SystemService,
    private readonly ussd: GsmUSSDActionService,
  ) {}

  public async getActiveGsmPorts(): Promise<string[]> {
    const activePorts: string[] = [];
    const allGsmPorts = await this.getAllPorts();
    allGsmPorts.map((port) => {
      if (port.isActive) {
        activePorts.push(port.port);
      }
    });

    return activePorts;
  }

  public async isPortActive(port: string): Promise<boolean> {
    const portInfo = (await this.getPortInfo(port, false)) as GetGsmPortInfoEvent;

    const isActive = this.getDChannelString(UtilsService.stringToArray(portInfo.d_channel), GSM_PORT_D_CHANEL_PARSE_STATUS);
    return this.isActive(isActive);
  }

  public async getPortInfo(port: string, format: boolean): Promise<GetGsmPortInfoEvent | GsmPortFormatInfo> {
    const action = new namiLib.Actions.Smscommand();
    action.Command = `gsm show span ${Number(port) + 1}`;
    const portInfo = await this.gsmGateway.gmsClientSend<GetGsmPortInfoEvent>(action);
    return !!format ? await this.formatPortInfo(port, portInfo.d_channel) : portInfo;
  }

  public async getAllPorts(): Promise<GsmPortsFormatInfo[]> {
    const action = new namiLib.Actions.Smscommand();
    action.Command = `gsm show spans`;
    const portsInfo = await this.gsmGateway.gmsClientSend<GetGsmPortsInfoEvent>(action);
    return this.formatPortsInfo(portsInfo);
  }

  private async formatPortInfo(port: string, dChanelInfo: string): Promise<GsmPortFormatInfo> {
    const operator = this.getDChannelString(UtilsService.stringToArray(dChanelInfo), GSM_PORT_D_CHANEL_PARSE_OPERATOR).match(
      /.*:\s(\w+)/,
    )[1] as Operators;

    const formatPortInfo = {
      port,
      operator,
      isActive: this.isActive(this.getDChannelString(UtilsService.stringToArray(dChanelInfo), GSM_PORT_D_CHANEL_PARSE_STATUS)),
      ...(await this.getAdditionalPortInfo(port, operator)),
    };
    await this.system.updateGsmGatewayConfig(formatPortInfo);
    return formatPortInfo;
  }

  private async getAdditionalPortInfo(port: string, operator: Operators): Promise<{ balance: string; number: string }> {
    const balance = await this.ussd.sendUSSD({
      gsmPort: port,
      ussdRequest: OperatoBalanceCodeMap[operator],
    });

    const number = await this.ussd.sendUSSD({
      gsmPort: port,
      ussdRequest: OperatoGetNumberCodeMap[operator],
    });

    return {
      balance,
      number,
    };
  }

  private isActive(status?: string): boolean {
    return !!status && GSM_PORT_D_CHANEL_PARSE_IS_ACTIVE.test(status);
  }

  private getDChannelString(dChanelArray: string[], needString: RegExp): string {
    return dChanelArray.filter((i) => needString.test(i))[0];
  }

  private formatPortsInfo(ports: GetGsmPortsInfoEvent): GsmPortsFormatInfo[] {
    let gmsPorts: string[] = [];
    const gsmPortsStatus: GsmPortsFormatInfo[] = [];

    ports.lines.map((line) => {
      if (/GSM span/i.test(line)) {
        console.log('line', line);

        gmsPorts = line
          .split('\n')
          .filter((i) => i != '')
          .filter((i) => /GSM span/i.test(i));
      }
    });

    gmsPorts.map((port) => {
      gsmPortsStatus.push({
        port: String(Number(port.match(/.*\sspan\s(\d+):/)[1]) - 1),
        isActive: GSM_PORT_D_CHANEL_PARSE_IS_ACTIVE.test(port),
      });
    });

    return gsmPortsStatus;
  }
}

@Injectable()
export class GsmSendSMSActionService {
  private readonly gsmConfigPorts: string[] = this.configService.get('gsmGateway.gatewayPorts');

  constructor(
    private readonly gsmGateway: GsmGateway,
    private readonly gsmPorts: GsmPortsActionService,
    private readonly configService: ConfigService,
    private readonly sms: SmsService,
  ) {}

  public async send(data: SendSMSInfo): Promise<SMSData> {
    try {
      return await this._sendSms(data);
    } catch (e) {
      throw e;
    }
  }

  public async scheduledSend(data: SendScheduledSMSInfo): Promise<ScheduledSMSData[]> {
    try {
      const smsData: ScheduledSMSData[] = [];
      await Promise.all(
        data.smsItems.map(async (sms: SendSMSScheduledTime) => {
          const smsSendData = await this.getSendData(sms, SmsStatusDescription.scheduled);
          smsData.push({ ...smsSendData, scheduledTime: sms.scheduledTime });
          await this.sms.addSmsInfo({
            ...smsSendData,
            type: SmsType.outgoing,
            scheduledTime: sms.scheduledTime,
          });
        }),
      );
      return smsData;
    } catch (e) {
      throw e;
    }
  }

  public async getScheduledSend() {
    try {
      return await this.sms.getScheduledSms();
    } catch (e) {
      throw e;
    }
  }

  public async deleteSms(unicid: string): Promise<{ result: boolean; message: string }> {
    try {
      const { deletedCount } = await this.sms.deleteSms(unicid);
      return {
        result: deletedCount === 0 ? false : true,
        message: deletedCount === 0 ? `Не найдена смс с unicid ${unicid}` : 'Смс успешно удалена',
      };
    } catch (e) {
      throw e;
    }
  }

  public async getSmsInfo(unicid: string): Promise<SMSData | Record<string, unknown>> {
    try {
      const result = await this.sms.getSmsStatusById(unicid);
      return result.length != 0 ? (result[0] as SMSData) : {};
    } catch (e) {
      throw e;
    }
  }

  private async _sendSms(data: SendSMSInfo): Promise<SMSData> {
    try {
      const sendSMSDataInfo = await this.getSendData(data, SmsStatusDescription.waiting);
      await this.gatewaySendSms(sendSMSDataInfo);
      await this.sms.addSmsInfo(sendSMSDataInfo);
      return sendSMSDataInfo;
    } catch (e) {
      throw e;
    }
  }

  private async getSendData(data: SendSMSInfo, status: SmsStatusDescription): Promise<SMSData> {
    try {
      const { mobileNumber, smsText, gsmPort } = data;
      const smsInfo: SMSData = {
        unicid: !!data.unicid ? data.unicid : UtilsService.generateId(true),
        mobileNumber: UtilsService.formatNumber(mobileNumber),
        smsText,
        gsmPort: await this.getGsmSendPort(gsmPort),
        status,
        type: SmsType.outgoing,
      };
      return smsInfo;
    } catch (e) {
      throw e;
    }
  }

  private async getGsmSendPort(port: string): Promise<string> {
    let isActive = false;
    if (!!port) {
      isActive = await this.gsmPorts.isPortActive(port);
    }
    return isActive ? port : await this.getActiveGsmPort();
  }

  private async getActiveGsmPort(): Promise<string> {
    if (!this.configService.get('gsmGateway.useRandomSendPort')) {
      throw new Error(ERROR_UNACTIVE_PORT);
    }
    return UtilsService.randomIntFromArray(await this.gsmPorts.getActiveGsmPorts());
  }

  private async gatewaySendSms({ gsmPort, mobileNumber, smsText, unicid }): Promise<void> {
    const action = new namiLib.Actions.Smscommand();
    action.command = `gsm send sms ${gsmPort} ${mobileNumber} "${smsText}" ${unicid}`;
    return await this.gsmGateway.gmsClientSend(action);
  }
}
