import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsteriskDialBeginEvent } from '../interfaces/asterisk.interfaces';
import { AsteriskEventType } from '../interfaces/asterisk.enum';
import { BlindTransferEventParser } from './events/blind-transfer-event-parser';
import { LogService } from '@app/log/log.service';
import { AMI_CONNECT_SUCCESS, AMI_INCORRECT_LOGIN, AMI_RECONECT, ERROR_AMI, INVALIDE_PEER } from '../asterisk.constants';
import { AsteriskAmiProvider } from '@app/config/interfaces/config.enum';
import { HangupEventParser } from './events/hangup-event-parser';
import { DialBeginEventParser } from './events/dial-begin-event-parser';
import { NewExtenEventParser } from './events/new-exten-event-parser';
import { AsteriskAmiEventProviderInterface, AsteriskUnionEvent } from './interfaces/ami.interfaces';

@Injectable()
export class AsteriskAmi implements OnApplicationBootstrap {
  private client: any;

  constructor(
    @Inject(AsteriskAmiProvider.ami) private readonly ami: any,
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly hangupEvent: HangupEventParser,
    private readonly blindTransfer: BlindTransferEventParser,
    private readonly dialBegin: DialBeginEventParser,
    private readonly newExten: NewExtenEventParser,
  ) {}

  get providers(): any {
    return {
      [AsteriskEventType.HangupEvent]: this.hangupEvent,
      [AsteriskEventType.BlindTransferEvent]: this.blindTransfer,
      [AsteriskEventType.DialBeginEvent]: this.dialBegin,
      [AsteriskEventType.EventNewexten]: this.newExten,
    };
  }

  public async onApplicationBootstrap() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      try {
        this.client = await this.ami;
        this.client.logLevel = this.configService.get('asterisk.ami.logLevel');
        this.client.open();
        this.client.on('namiConnected', () => this.log.info(AMI_CONNECT_SUCCESS, AsteriskAmi.name));
        this.client.on('namiConnectionClose', () => this.connectionClose());
        this.client.on('namiLoginIncorrect', () => this.loginIncorrect());
        this.client.on('namiInvalidPeer', () => this.invalidPeer());
        this.client.on(
          'namiEventDialBegin',
          async (event: AsteriskDialBeginEvent) => await this.namiEvent(event, AsteriskEventType.DialBeginEvent),
        );
      } catch (e) {
        this.log.error(`${ERROR_AMI}: ${e}`, AsteriskAmi.name);
      }
    }
  }

  private namiEvent(event: AsteriskUnionEvent, eventType: AsteriskEventType) {
    try {
      const provider = this.getProvider(eventType);
      return provider.parseEvent(event);
    } catch (e) {
      this.log.error(e, AsteriskAmi.name);
    }
  }

  private getProvider(eventType: AsteriskEventType): AsteriskAmiEventProviderInterface {
    return this.providers[eventType];
  }

  public async amiClientSend<T>(action: any): Promise<T> {
    return await new Promise((resolve) => {
      this.client.send(action, (event: any) => {
        this.log.info(event, AsteriskAmi.name);
        resolve(event);
      });
    });
  }

  private connectionClose() {
    this.log.error(AMI_RECONECT, AsteriskAmi.name);
    setTimeout(() => {
      this.client.open();
    }, 5000);
  }

  private loginIncorrect() {
    this.log.error(AMI_INCORRECT_LOGIN, AsteriskAmi.name);
    // process.exit();
  }

  private invalidPeer() {
    this.log.error(INVALIDE_PEER, AsteriskAmi.name);
    // process.exit();
  }
}