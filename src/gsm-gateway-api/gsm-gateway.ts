import { LogService } from '@app/log/log.service';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ReceivedSMSEventParser } from './gsm/received-sms-event-parser';
import { UpdateSMSSendEventParser } from './gsm/update-sms-send-event-parser';
import {
  GsmGatewayEventProviderInterface,
  GsmGatewayUnionEvent,
  ReceivedSMSEvent,
  UpdateSMSSendEvent,
} from './interfaces/gsm-gateway-api.interfaces';
import { GsmGatewaykEventType } from './interfaces/gsm-gateway-api.enum';
import { CONNECT_SUCCESS, ERROR_GSM, GSM_RECONECT, INCORRECT_LOGIN } from './gsm-api-gateway.constants';
import { GsmGatewayProvider } from '@app/config/interfaces/config.enum';

@Injectable()
export class GsmGateway implements OnApplicationBootstrap {
  private gmsClient: any;
  constructor(
    @Inject(GsmGatewayProvider.gsm) private readonly gsm: any,
    private readonly updateSMSSend: UpdateSMSSendEventParser,
    private readonly receivedSMSEvent: ReceivedSMSEventParser,
    private readonly log: LogService,
  ) {}

  get providers(): any {
    return {
      [GsmGatewaykEventType.UpdateSMSSend]: this.updateSMSSend,
      [GsmGatewaykEventType.ReceivedSMSEvent]: this.receivedSMSEvent,
    };
  }

  public async onApplicationBootstrap() {
    try {
      this.gmsClient = await this.gsm;
      this.gmsClient.logLevel = 5;
      this.gmsClient.open();
      this.gmsClient.on('namiConnected', () => this.log.info(CONNECT_SUCCESS, GsmGateway.name));
      this.gmsClient.on('namiConnectionClose', () => this.connectionClose());
      this.gmsClient.on('namiLoginIncorrect', () => this.loginIncorrect());
      this.gmsClient.on('namiEventUpdateSMSSend', (event: UpdateSMSSendEvent) =>
        this.parseGsmEvent(event, GsmGatewaykEventType.UpdateSMSSend),
      );
      this.gmsClient.on('namiEventReceivedSMS', (event: ReceivedSMSEvent) =>
        this.parseGsmEvent(event, GsmGatewaykEventType.ReceivedSMSEvent),
      );
    } catch (e) {
      this.log.error(`${ERROR_GSM} ${e}`, GsmGateway.name);
    }
  }

  private parseGsmEvent(event: GsmGatewayUnionEvent, eventType: GsmGatewaykEventType) {
    try {
      const provider = this.getProvider(eventType);
      return provider.parseEvent(event);
    } catch (e) {
      this.log.error(e, GsmGateway.name);
    }
  }

  public async gmsClientSend<T>(action: any): Promise<T> {
    return await new Promise((resolve) => {
      this.gmsClient.send(action, (event: any) => {
        this.log.info(event, GsmGateway.name);
        resolve(event);
      });
    });
  }

  private getProvider(eventType: GsmGatewaykEventType): GsmGatewayEventProviderInterface {
    return this.providers[eventType];
  }

  private connectionClose() {
    this.log.error(GSM_RECONECT, GsmGateway.name);
    setTimeout(() => {
      this.gmsClient.open();
    }, 5000);
  }

  private loginIncorrect() {
    this.log.error(INCORRECT_LOGIN, GsmGateway.name);
    //process.exit();
  }
}
