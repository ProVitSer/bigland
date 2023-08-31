/* eslint-disable @typescript-eslint/no-unused-vars */
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { LogService } from '@app/log/log.service';
import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { AsteriskCdr } from '@app/asterisk-cdr/asterisk-cdr.entity';
import { AmocrmUsers } from '@app/amocrm-users/amocrm-users.schema';
import { AsteriskCdrService } from '@app/asterisk-cdr/asterisk-cdr.service';
import { DirectionType } from '@app/amocrm/interfaces/amocrm.enum';
import {
  AsteriskAmiEventProviderInterface,
  AsteriskHangupHandlerProviderInterface,
  AsteriskHangupHandlerProviders,
  AsteriskNewExten,
} from '../interfaces/ami.interfaces';
import { AmocrmV4Service } from '@app/amocrm/v4/services';
import { DEFAULT_TIMEOUT_HANDLER } from '../ami.constants';
import { HangupHandler } from '../interfaces/ami.enum';

@Injectable()
export class NewExtenEventParser implements AsteriskAmiEventProviderInterface {
  constructor(
    private readonly log: LogService,
    private readonly outboundHangupHandler: OutboundHangupHandler,
    private readonly inboundHangupHandler: InboundHangupHandler,
    private readonly pozvonimHangupHandler: PozvonimHangupHandler,
  ) {}

  private get providers(): AsteriskHangupHandlerProviders {
    return {
      [HangupHandler.outbound]: this.outboundHangupHandler,
      [HangupHandler.inbound]: this.inboundHangupHandler,
      [HangupHandler.pozvonim]: this.pozvonimHangupHandler,
    };
  }

  async parseEvent(event: AsteriskNewExten): Promise<void> {
    try {
      return await this.parseNewExtenEvent(event);
    } catch (e) {
      this.log.error(String(event), NewExtenEventParser.name);
    }
  }

  private async parseNewExtenEvent(event: AsteriskNewExten): Promise<void> {
    try {
      if (
        [HangupHandler.outbound, HangupHandler.inbound, HangupHandler.pozvonim].includes(event.context as HangupHandler) &&
        event.application === 'NoOp'
      ) {
        await UtilsService.sleep(DEFAULT_TIMEOUT_HANDLER);
        await this.getProvider(event.context as HangupHandler).handler(event);
      }
    } catch (e) {
      throw e;
    }
  }

  private getProvider(context: HangupHandler): AsteriskHangupHandlerProviderInterface {
    return this.providers[context];
  }
}

@Injectable()
export class BaseHangupHandlerService {
  constructor(
    protected readonly log: LogService,
    protected readonly asteriskCdr: AsteriskCdrService,
    protected readonly amocrmV4Service: AmocrmV4Service,
    protected readonly amocrmUsers: AmocrmUsersService,
  ) {}

  async sendCallInfoEvent(asteriskCdr: AsteriskCdr, channel: string, callType: DirectionType): Promise<void> {
    try {
      const amocrmUsers = await this.getUserId(channel);
      return await this.sendCallInfoToCRM(asteriskCdr, amocrmUsers.amocrmId, callType);
    } catch (e) {
      this.log.error(e, BaseHangupHandlerService.name);
    }
  }

  private async getUserId(channel: string): Promise<AmocrmUsers> {
    return (await this.amocrmUsers.getAmocrmUser(UtilsService.replaceChannel(channel)))[0];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private async sendCallInfoToCRM(asteriskCdr: AsteriskCdr, amocrmId: number, callType: DirectionType): Promise<void> {}
}

@Injectable()
export class OutboundHangupHandler extends BaseHangupHandlerService implements AsteriskHangupHandlerProviderInterface {
  async handler(event: AsteriskNewExten): Promise<void> {
    try {
      const asteriskCdr = await this.asteriskCdr.searchOutgoingCallInfoInCdr(event.uniqueid);
      if (!!!asteriskCdr && asteriskCdr == null) return;
      await this.sendCallInfoEvent(asteriskCdr[0], asteriskCdr[0].channel, DirectionType.outbound);
    } catch (e) {
      this.log.error(e, OutboundHangupHandler.name);
    }
  }
}

@Injectable()
export class InboundHangupHandler extends BaseHangupHandlerService implements AsteriskHangupHandlerProviderInterface {
  async handler(event: AsteriskNewExten): Promise<void> {
    try {
      const asteriskCdr = await this.asteriskCdr.searchIncomingCallInfoInCdr(event.uniqueid);
      if (asteriskCdr.length == 0) return;
      await Promise.all(
        asteriskCdr.map(async (asteriskCdr: AsteriskCdr) => {
          await this.sendCallInfoEvent(asteriskCdr, asteriskCdr.dstchannel, DirectionType.inbound);
        }),
      );
    } catch (e) {
      this.log.error(e, InboundHangupHandler.name);
    }
  }
}

@Injectable()
export class PozvonimHangupHandler extends BaseHangupHandlerService implements AsteriskHangupHandlerProviderInterface {
  async handler(event: AsteriskNewExten): Promise<void> {
    try {
      const asteriskCdr = await this.asteriskCdr.searchPozvonimCallInfoInCdr(event.uniqueid);
      if (!!!asteriskCdr && asteriskCdr == null) return;
      await this.sendCallInfoEvent(asteriskCdr[0], asteriskCdr[0].channel, DirectionType.outbound);
    } catch (e) {
      this.log.error(e, PozvonimHangupHandler.name);
    }
  }
}
