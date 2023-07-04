import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import Ari, { Channel } from 'ari-client';
import { AsteriskAriOriginate } from '../interfaces/asterisk.interfaces';
import { AsteriskCallApiUnion } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { AriCallType } from './interfaces/ari.enum';
import { AsteriskAriCall, AsteriskAriCallProviders } from './interfaces/ari.interfaces';
import { MonitoringAriCall, PozvonimAriCall, CheckSpamNumberAriCall, CheckOperatorSpamAriCall } from './providers';

@Injectable()
export class AriACallService implements OnApplicationBootstrap {
  private client: { ariClient: Ari.Client };
  constructor(
    @Inject(AsteriskAriProvider.aricall) private readonly ari: { ariClient: Ari.Client },
    private readonly monitoring: MonitoringAriCall,
    private readonly pozvonim: PozvonimAriCall,
    private readonly checkSpamNumber: CheckSpamNumberAriCall,
    private readonly checkOperatorSpam: CheckOperatorSpamAriCall,
  ) {}

  private get providers(): AsteriskAriCallProviders {
    return {
      [AriCallType.monitoring]: this.monitoring,
      [AriCallType.pozvonim]: this.pozvonim,
      [AriCallType.checkSpamNumber]: this.checkSpamNumber,
      [AriCallType.checkOperatorSpam]: this.checkOperatorSpam,
    };
  }

  public async onApplicationBootstrap() {
    this.client = this.ari;
  }

  public async sendCall(data: AsteriskCallApiUnion, callType: AriCallType): Promise<Ari.Channel> {
    try {
      const provider = this.getProvider(callType);
      const originateInfo = await provider.getOriginateInfo(data, this.client.ariClient);
      return await this.sendAriCall(originateInfo);
    } catch (e) {
      throw e;
    }
  }

  private getProvider(callType: AriCallType): AsteriskAriCall {
    return this.providers[callType];
  }

  private async sendAriCall(originateInfo: AsteriskAriOriginate): Promise<Channel> {
    const channel = this.getAriChannel();
    return await channel.originate({
      ...originateInfo,
    });
  }

  private getAriChannel(): Ari.Channel {
    return this.client.ariClient.Channel();
  }
}
