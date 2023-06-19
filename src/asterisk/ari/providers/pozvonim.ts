import { AsteriskAriOriginate } from '@app/asterisk/interfaces/asterisk.interfaces';
import { AsteriskAriCall } from '../interfaces/ari.interfaces';
import { ChannelType, EndpointState } from '@app/asterisk/interfaces/asterisk.enum';
import { PozvominCall } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import Ari from 'ari-client';
import { Injectable } from '@nestjs/common';
import { AmocrmV2Service } from '@app/amocrm/v2/amocrm-v2.service';
import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { PozvonimCallDataAdapter } from '../adapters/pozvonim-call.adapter';

@Injectable()
export class PozvonimAriCall implements AsteriskAriCall {
  constructor(
    private readonly amocrmV2Service: AmocrmV2Service,
    private readonly amocrmUsers: AmocrmUsersService,
    private readonly pozvonimDataAdapter: PozvonimCallDataAdapter,
  ) {}
  async getOriginateInfo(data: PozvominCall, ariClient: Ari.Client): Promise<AsteriskAriOriginate> {
    try {
      if (!(await this.checkEndpointState(ariClient, data.SIP_ID))) throw new Error(`Добавочный номер ${data.SIP_ID} не зарегистрирован`);
      const amocrmUsers = await this.amocrmUsers.getAmocrmUser(data.SIP_ID);
      await this.amocrmV2Service.incomingCallEvent(data.DST_NUM, Number(amocrmUsers[0]?.amocrmId));
      return await this.pozvonimDataAdapter.getOriginateInfo(data);
    } catch (e) {
      throw e;
    }
  }

  private async checkEndpointState(ariClient: Ari.Client, extension: string): Promise<boolean> {
    const endpoints = await ariClient.endpoints.get({ tech: ChannelType.PJSIP, resource: extension });
    return endpoints.state == EndpointState.online;
  }
}
