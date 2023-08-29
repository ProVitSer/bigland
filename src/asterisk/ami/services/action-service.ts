import { IDnd } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { Injectable } from '@nestjs/common';
import * as namiLib from 'nami';
import { AsteriskAmi } from '../ami';
import {
  AsteriskDNDStatusResponse,
  AsteriskStatusResponse,
  dndStatusMap,
  EventsStatus,
  hintStatusMap,
  SetDNDStatusResult,
} from '../../interfaces/asterisk.interfaces';
import { ChannelType, DbFamilyType, statusHint } from '../../interfaces/asterisk.enum';
import { LogService } from '@app/log/log.service';
import { AMI_OUTBOUND_CALL } from '@app/asterisk/ari/ari.constants';

@Injectable()
export class AmiActionService {
  constructor(private readonly log: LogService, private readonly ami: AsteriskAmi) {}

  public async sendAmiCall(localExtension: string, outgoingNumber: string): Promise<void> {
    try {
      this.log.info(
        `Исходящий вызов из webhook CRM: внутренний номер ${localExtension} внешний номер ${outgoingNumber}`,
        AmiActionService.name,
      );
      const action = new namiLib.Actions.Originate();
      action.channel = `${ChannelType.PJSIP}/${localExtension}`;
      action.callerid = localExtension;
      action.priority = AMI_OUTBOUND_CALL.priority;
      action.timeout = AMI_OUTBOUND_CALL.timeout;
      action.context = AMI_OUTBOUND_CALL.timeout;
      action.exten = outgoingNumber;
      action.async = AMI_OUTBOUND_CALL.async;
      const resultInitCall: any = await this.ami.amiClientSend(action);
      this.log.info(`Результат инициации вызова ` + resultInitCall, AmiActionService.name);
    } catch (e) {
      throw e;
    }
  }

  private async setHintStatus(extension: string, hint: statusHint): Promise<void> {
    try {
      const action = new namiLib.Actions.Command();
      action.Command = `devstate change Custom:DND${extension} ${hint}`;
      return await this.ami.amiClientSend(action);
    } catch (e) {
      throw e;
    }
  }

  public async setDNDStatus(data: IDnd): Promise<SetDNDStatusResult> {
    try {
      const extensionStatusList = {};

      await Promise.all(
        data.sip_id.map(async (sip_id: string) => {
          const checkExtension = await this.getDNDStatus(sip_id);
          if (checkExtension.response === 'Error') {
            extensionStatusList[sip_id] = { status: 'error' };
            return;
          }
          const resultSend: AsteriskStatusResponse = await this.dndPut(sip_id, data.dnd_status);
          this.log.info(resultSend, AmiActionService.name);
          const hint = hintStatusMap[data.dnd_status];

          if (resultSend.response == 'Success') {
            extensionStatusList[sip_id] = { status: 'success' };

            return this.setHintStatus(sip_id, hint);
          } else {
            return;
          }
        }),
      );

      return extensionStatusList;
    } catch (e) {
      throw e;
    }
  }

  private async dndPut(sipId: string, dndStatus: string): Promise<AsteriskStatusResponse> {
    const action = new namiLib.Actions.DbPut();
    action.Family = DbFamilyType.DND;
    action.Key = sipId;
    action.Val = dndStatusMap[dndStatus];
    return await this.ami.amiClientSend(action);
  }

  private async getDNDStatus(extension: string): Promise<AsteriskDNDStatusResponse> {
    const action = new namiLib.Actions.DbGet();
    action.Family = DbFamilyType.DND;
    action.Key = extension;
    return await this.ami.amiClientSend(action);
  }

  public async getCallStatus(): Promise<EventsStatus[]> {
    const action = new namiLib.Actions.Status();
    const callInfo = await this.ami.amiClientSend<AsteriskStatusResponse>(action);
    return this.deleteNoUserProp(callInfo);
  }

  private deleteNoUserProp(callInfo: AsteriskStatusResponse): EventsStatus[] {
    return callInfo.events.map((event: EventsStatus) => {
      delete event.lines;
      delete event.EOL;
      delete event.variables;
      return event;
    });
  }
}
