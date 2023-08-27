import { AsteriskAriOriginate } from '@app/asterisk/interfaces/asterisk.interfaces';
import { AsteriskAriCall } from '../interfaces/ari.interfaces';
import { ChannelType, EndpointState } from '@app/asterisk/interfaces/asterisk.enum';
import { PozvominCall } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import Ari from 'ari-client';
import { Injectable } from '@nestjs/common';
import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { PozvonimCallDataAdapter } from '../adapters/pozvonim-call.adapter';
import { AmocrmV2ApiService } from '@app/amocrm/v2/services/amocrm-v2-api.service';

@Injectable()
export class PozvonimAriCall implements AsteriskAriCall {
  constructor(
    private readonly amocrmV2ApiService: AmocrmV2ApiService,
    private readonly amocrmUsers: AmocrmUsersService,
    private readonly pozvonimDataAdapter: PozvonimCallDataAdapter,
  ) {}
  async getOriginateInfo(data: PozvominCall, ariClient: Ari.Client): Promise<AsteriskAriOriginate> {
    try {
      if (!(await this.checkEndpointExist(ariClient, data.SIP_ID))) return await this.sendCallToCC(data);
      if (!(await this.checkEndpointState(ariClient, data.SIP_ID))) return await this.sendCallToCC(data);
      return await this.sendCallToLocalExtension(data);
    } catch (e) {
      throw e;
    }
  }

  private async sendCallToCC(data: PozvominCall): Promise<AsteriskAriOriginate> {
    try {
      return await this.pozvonimDataAdapter.getCCOriginateInfo(data);
    } catch (e) {
      throw e;
    }
  }

  private async sendCallToLocalExtension(data: PozvominCall): Promise<AsteriskAriOriginate> {
    try {
      const amocrmUsers = await this.amocrmUsers.getAmocrmUser(data.SIP_ID);
      await this.amocrmV2ApiService.sendIncomingCallEvent(data.DST_NUM, Number(amocrmUsers[0]?.amocrmId));
      return await this.pozvonimDataAdapter.getLocalExtensionOriginateInfo(data);
    } catch (e) {
      throw e;
    }
  }

  private async checkEndpointExist(ariClient: Ari.Client, extension: string): Promise<boolean> {
    const endpoints = await ariClient.endpoints.list();
    return endpoints
      .filter((endpoint: Ari.Endpoint) => /^\d{3}$/.test(endpoint.resource))
      .map((endpoint: Ari.Endpoint) => endpoint.resource)
      .includes(extension);
  }
  private async checkEndpointState(ariClient: Ari.Client, extension: string): Promise<boolean> {
    const endpoints = await ariClient.endpoints.get({ tech: ChannelType.PJSIP, resource: extension });
    return endpoints.state == EndpointState.online;
  }
}
