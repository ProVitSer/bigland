import { Injectable } from '@nestjs/common';
import { AmiActionService } from '@app/asterisk/ami/services/action-service';
import { ActualExtensionsState, DndExtensionsStatus, ExtensionState, ExtensionsItemsDndStatus } from '../interfaces/asterisk-api.interfaces';
import { AsteriskBaseStatusResponse, AsteriskDNDStatusResponse, AsteriskExtensionStatusEvent, DNDStatus } from '@app/asterisk/ami/interfaces/ami.interfaces';
import { DND_STATUS_MAP, HINT_STATE_TO_BUSYNESS_STATE } from '../asterisk-api.constants';
import { SipBusynessStateId } from '../interfaces/asterisk-api.enum';

@Injectable()
export class ExtensionsStateService {
    constructor(private readonly ami: AmiActionService) {}

    public async getExtensionsState(): Promise<ActualExtensionsState> {
        try {

            const event = await this.ami.showHints();

            return this.formateExtensionsState(event);

        } catch (e) {

            throw e;

        }
    }

    public async getDndStatus(): Promise<DndExtensionsStatus> {
        try {

            const extensionnsItemsDndStatus: ExtensionsItemsDndStatus[] = [];

            const extensionsState = await this.getExtensionsState();
            
            for (const number of extensionsState.items) {

                const { events } = await this.ami.getDNDStatus(String(number.sip_id));

                const eventsArray = events as unknown as DNDStatus[]
                
                extensionnsItemsDndStatus.push({
                    sip_id: number.sip_id,
                    do_not_disturb_status: (eventsArray.length != 0) ? DND_STATUS_MAP[eventsArray.filter((event: DNDStatus) => event.key == number.sip_id)[0].val] : ""
                })

            }

            
            return {
                items: extensionnsItemsDndStatus,
            };

        } catch (e) {

            throw e;
            
        }
    }

    private formateExtensionsState(event: AsteriskBaseStatusResponse<AsteriskExtensionStatusEvent[]> ): ActualExtensionsState {

        const extensionsState: ExtensionState[] = [];

        event.events.map((e: AsteriskExtensionStatusEvent) => {

            if (e.context !== 'ext-local') return;

            extensionsState.push({
                sip_id: e.exten,
                sip_busyness_state_id: HINT_STATE_TO_BUSYNESS_STATE[e.statustext] || SipBusynessStateId.error,
            });

        });

        return {
            items: extensionsState,
        };

    }
}