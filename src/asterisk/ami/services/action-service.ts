import { DndData } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { Injectable } from '@nestjs/common';
import * as namiLib from 'nami';
import { AsteriskAmi } from '../ami';
import { LogService } from '@app/log/log.service';
import { AMI_OUTBOUND_CALL } from '@app/asterisk/ari/ari.constants';
import {
  AsteriskDNDStatusResponse,
  AsteriskStatusResponse,
  DndStatus,
  EventsStatus,
  SetDNDStatusResult,
} from '../interfaces/ami.interfaces';
import { DND_API_TO_DND_STATUS, DND_API_TO_HINT_STATUS } from '../ami.constants';
import { ChannelType } from '@app/asterisk/ari/interfaces/ari.enum';
import { DbFamilyType, DndStatusType, HintStatus } from '../interfaces/ami.enum';

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

    private async setHintStatus(extension: string, hint: HintStatus): Promise<void> {
        try {

            const action = new namiLib.Actions.Command();

            action.Command = `devstate change Custom:DND${extension} ${hint}`;

            return await this.ami.amiClientSend(action);

        } catch (e) {

            throw e;

        }
    }

    public async setDNDStatus(data: DndData): Promise<SetDNDStatusResult> {
        try {

            const sip_ids: DndStatus[] = [];

            await Promise.all(
                data.sip_id.map(async (sip_id: string) => {

                    const checkExtension = await this.getDNDStatus(sip_id);

                    if (checkExtension.response === 'Error') {
                        sip_ids.push({
                            sip_id,
                            status: DndStatusType.error
                        });
                        return;
                    };

                    const resultSend: AsteriskStatusResponse = await this.dndPut(sip_id, data.dnd_status);

                    this.log.info(resultSend, AmiActionService.name);

                    const hint = DND_API_TO_HINT_STATUS[data.dnd_status];

                    if (resultSend.response == 'Success') {

                        sip_ids.push({
                            sip_id,
                            status: DndStatusType.success
                        });

                        this.setHintStatus(sip_id, hint);

                    } else {

                        return;

                    };
                }),
            );

            return {
                sip_ids
            };
        } catch (e) {
            throw e;
        }
    }

    private async dndPut(sipId: string, dndStatus: string): Promise<AsteriskStatusResponse> {

        const action = new namiLib.Actions.DbPut();

        action.Family = DbFamilyType.DND;
        action.Key = sipId;
        action.Val = DND_API_TO_DND_STATUS[dndStatus];

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