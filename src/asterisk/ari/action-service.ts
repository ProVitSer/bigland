import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { AmocrmV2Service } from '@app/amocrm/v2/amocrm-v2.service';
import { PozvominCall } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import Ari, { Channel } from 'ari-client';
import { ARI_OUTBOUND_CALL, ARI_OUTBOUND_CALL_OPERATOR, POZVONIM_OUTBOUND_CALL } from '../asterisk.config';
import { ChannelType } from '../interfaces/asterisk.enum';

@Injectable()
export class AriActionService implements OnApplicationBootstrap {
  private client: { ariClient: Ari.Client };
  constructor(
    @Inject(AsteriskAriProvider.aricall) private readonly ari: { ariClient: Ari.Client },
    private readonly amocrmV2Service: AmocrmV2Service,
    private readonly amocrmUsers: AmocrmUsersService,
  ) {}

  public async onApplicationBootstrap() {
    this.client = this.ari;
  }

  public async sendAriCall(number: string): Promise<void> {
    try {
      const endpoint = `${ChannelType.PJSIP}/${number}@${ARI_OUTBOUND_CALL_OPERATOR}`;
      return await this.call(endpoint);
    } catch (e) {
      throw e;
    }
  }

  private async call(endpoint: string): Promise<void> {
    const channel = this.getAriChannel();
    await channel.originate({
      endpoint,
      ...ARI_OUTBOUND_CALL,
    });
    return;
  }

  public async pozvonimOutboundCall(data: PozvominCall): Promise<Channel> {
    try {
      const amocrmUsers = await this.amocrmUsers.getAmocrmUser(data.SIP_ID);
      await this.amocrmV2Service.incomingCallEvent(data.DST_NUM, String(amocrmUsers[0]?.amocrmId));
      const originateData = this.getPozvonimOriginateStruct(data);
      const channel = this.getAriChannel();
      return await channel.originate(originateData);
    } catch (e) {
      throw e;
    }
  }

  private getPozvonimOriginateStruct(data: PozvominCall) {
    const formatDstNumber = `8${data.DST_NUM.substr(1, 11)}`;
    return {
      endpoint: `${ChannelType.PJSIP}/${data.SIP_ID}`,
      callerId: formatDstNumber,
      label: formatDstNumber,
      ...POZVONIM_OUTBOUND_CALL,
      extension: data.SIP_ID,
      variables: {
        var1: formatDstNumber,
        var2: data.SIP_ID,
      },
    };
  }

  private getAriChannel(): Ari.Channel {
    return this.client.ariClient.Channel();
  }
}
