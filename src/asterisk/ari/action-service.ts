import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { AmocrmService } from '@app/amocrm/amocrm.service';
import { PozvominCall } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import Ari, { Channel } from 'ari-client';
import {
  ARIOUTBOUNDCALL,
  ARIOUTBOUNDCALLOPERATOR,
  POZVONIMOUTBOUNDCALL,
} from '../asterisk.config';
import { ChannelType } from '../interfaces/asterisk.enum';

@Injectable()
export class AriActionService implements OnApplicationBootstrap {
  private client: { ariClient: Ari.Client };
  private ariChanel: Ari.Channel;
  constructor(
    @Inject('ARICALL') private readonly ari: { ariClient: Ari.Client },
    private readonly amocrm: AmocrmService,
    private readonly amocrmUsers: AmocrmUsersService,
  ) {}

  public async onApplicationBootstrap() {
    this.client = this.ari;
    this.ariChanel = this.client.ariClient.Channel();
  }

  public async sendAriCall(number: string): Promise<void> {
    try {
      const endpoint = `${ChannelType.PJSIP}/${number}@${ARIOUTBOUNDCALLOPERATOR}`;
      return await this.call(endpoint);
    } catch (e) {
      throw e;
    }
  }

  private async call(endpoint: string): Promise<void> {
    await this.ariChanel.originate({
      endpoint,
      ...ARIOUTBOUNDCALL,
    });
    return;
  }

  public async pozvonimOutboundCall(data: PozvominCall): Promise<Channel> {
    try {
      const amocrmUsers = await this.amocrmUsers.getAmocrmUser(data.SIP_ID);
      await this.amocrm.incomingCallEvent(
        data.DST_NUM,
        String(amocrmUsers[0]?.amocrmId),
      );
      const originateData = this.getPozvonimOriginateStruct(data);
      return await this.ariChanel.originate(originateData);
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
      ...POZVONIMOUTBOUNDCALL,
      extension: data.SIP_ID,
      variables: {
        var1: formatDstNumber,
        var2: data.SIP_ID,
      },
    };
  }
}
