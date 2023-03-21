import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { AmocrmV2Service } from '@app/amocrm/v2/amocrm-v2.service';
import { PozvominCall } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import Ari, { Channel } from 'ari-client';
import { AMD_OUTBOUND_CALL, ARI_OUTBOUND_CALL, ARI_OUTBOUND_CALL_OPERATOR, POZVONIM_OUTBOUND_CALL } from '../asterisk.config';
import { ChannelType, EndpointState } from '../interfaces/asterisk.enum';
import { AsteriskAriOriginate } from '../interfaces/asterisk.interfaces';

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

  public async monitoringOutboundCall(number: string, description: string): Promise<Channel> {
    try {
      const originateInfo = {
        endpoint: `${ChannelType.PJSIP}/${number}@${ARI_OUTBOUND_CALL_OPERATOR}`,
        ...ARI_OUTBOUND_CALL,
      };
      return await this.sendAriCall(originateInfo);
    } catch (e) {
      throw e;
    }
  }

  public async pozvonimOutboundCall(data: PozvominCall): Promise<Channel> {
    try {
      if (!(await this.checkEndpointState(data.SIP_ID))) throw new Error(`Добавочный номер ${data.SIP_ID} не зарегистрирован`);

      const amocrmUsers = await this.amocrmUsers.getAmocrmUser(data.SIP_ID);
      await this.amocrmV2Service.incomingCallEvent(data.DST_NUM, String(amocrmUsers[0]?.amocrmId));
      return await this.sendAriCall(this.pozvonimOriginateStruct(data));
    } catch (e) {
      throw e;
    }
  }

  public async amdCall(number: string) {
    try {
      const originateInfo = {
        callerId: number,
        ...AMD_OUTBOUND_CALL,
      };
      return await this.sendAriCall(originateInfo);
    } catch (e) {
      throw e;
    }
  }

  private async sendAriCall(originateInfo: AsteriskAriOriginate): Promise<Channel> {
    const channel = this.getAriChannel();
    await channel.originate({
      ...originateInfo,
    });
    return;
  }

  private pozvonimOriginateStruct(data: PozvominCall): AsteriskAriOriginate {
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

  private async checkEndpointState(extension: string): Promise<boolean> {
    const endpoints = await this.client.ariClient.endpoints.get({ tech: ChannelType.PJSIP, resource: extension });
    return endpoints.state == EndpointState.online;
  }

  private getAriChannel(): Ari.Channel {
    return this.client.ariClient.Channel();
  }
}
