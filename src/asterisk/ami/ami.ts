import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlindTransferEventParser } from './events/blind-transfer-event-parser';
import { LogService } from '@app/log/log.service';
import { AsteriskAmiProvider } from '@app/config/interfaces/config.enum';
import { HangupEventParser } from './events/hangup-event-parser';
import { DialBeginEventParser } from './events/dial-begin-event-parser';
import { NewExtenEventParser } from './events/new-exten-event-parser';
import {
  AsteriskAmiEventProviderInterface,
  AsteriskAmiEventProviders,
  AsteriskDialBeginEvent,
  AsteriskUnionEvent,
} from './interfaces/ami.interfaces';
import {
  AMI_CONNECT_SUCCESS,
  AMI_INCORRECT_LOGIN,
  AMI_RECONECT,
  DEFAULT_REOPEN_AMI_CLIENT,
  ERROR_AMI,
  INVALIDE_PEER,
} from './ami.constants';
import { AsteriskEventType } from './interfaces/ami.enum';
import { AmiAsteriskEnvironmentVariables, AsteriskEnvironmentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class AsteriskAmi implements OnApplicationBootstrap {
  private client: any;
  private asteriskConfig = this.configService.get<AsteriskEnvironmentVariables>('asterisk');
  private amiConfig = this.asteriskConfig.ami.filter((a: AmiAsteriskEnvironmentVariables) => a.providerName == AsteriskAmiProvider.ami)[0];
  constructor(
    @Inject(AsteriskAmiProvider.ami) private readonly ami: any,
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly hangupEvent: HangupEventParser,
    private readonly blindTransfer: BlindTransferEventParser,
    private readonly dialBegin: DialBeginEventParser,
    private readonly newExten: NewExtenEventParser,
  ) {}

  private get providers(): AsteriskAmiEventProviders {
    return {
      [AsteriskEventType.HangupEvent]: this.hangupEvent,
      [AsteriskEventType.BlindTransferEvent]: this.blindTransfer,
      [AsteriskEventType.DialBeginEvent]: this.dialBegin,
      [AsteriskEventType.EventNewexten]: this.newExten,
    };
  }

  public async onApplicationBootstrap() {
    try {
      this.client = await this.ami;
      this.client.logLevel = this.amiConfig.logLevel;
      this.client.open();
      this.client.on('namiConnected', () => this.log.info(AMI_CONNECT_SUCCESS, AsteriskAmi.name));
      this.client.on('namiConnectionClose', () => this.connectionClose());
      this.client.on('namiLoginIncorrect', () => this.loginIncorrect());
      this.client.on('namiInvalidPeer', () => this.invalidPeer());
      if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
        this.client.on(
          'namiEventDialBegin',
          async (event: AsteriskDialBeginEvent) => await this.namiEvent(event, AsteriskEventType.DialBeginEvent),
        );
      }
    } catch (e) {
      this.log.error(`${ERROR_AMI}: ${e}`, AsteriskAmi.name);
    }
  }

  private namiEvent(event: AsteriskUnionEvent, eventType: AsteriskEventType): Promise<void> {
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
    try {
      return await new Promise((resolve) => {
        this.client.send(action, (event: any) => {
          resolve(event);
        });
      });
    } catch (e) {
      this.log.error(e, AsteriskAmi.name);
      throw e;
    }
  }

  private connectionClose(): void {
    this.log.error(AMI_RECONECT, AsteriskAmi.name);
    setTimeout(() => {
      this.client.open();
    }, DEFAULT_REOPEN_AMI_CLIENT);
  }

  private loginIncorrect(): void {
    this.log.error(AMI_INCORRECT_LOGIN, AsteriskAmi.name);
  }

  private invalidPeer(): void {
    this.log.error(INVALIDE_PEER, AsteriskAmi.name);
  }
}
