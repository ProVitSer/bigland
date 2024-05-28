import { Injectable } from '@nestjs/common';
import { AmiActionService } from '@app/asterisk/ami/services/action-service';
import { ActualExtensionBusynessState, ActualExtensionOriginalState, DndExtensionsStatus, ExtensionBusynessState, ExtensionOriginalState, ExtensionsItemsDndStatus } from '../interfaces/asterisk-api.interfaces';
import { AsteriskBaseStatusResponse, AsteriskExtensionStatusEvent, DNDStatus } from '@app/asterisk/ami/interfaces/ami.interfaces';
import { DND_STATUS_MAP, HINT_STATE_TO_BUSYNESS_STATE } from '../asterisk-api.constants';
import { SipBusynessStateId } from '../interfaces/asterisk-api.enum';

@Injectable()
export class ExtensionsStateService {
    constructor(private readonly ami: AmiActionService) {}

    public async getExtensionBusynessState(): Promise<ActualExtensionBusynessState> {
        try {

            const extensionsHints = await this.ami.showHints();

            return this.formateExtensionBusynessState(extensionsHints);

        } catch (e) {

            throw e;

        }
    }

    public async getExtensionOriginalState(): Promise<ActualExtensionOriginalState> {
        try {

            const extensionsHints = await this.ami.showHints();

            return this.formateExtensionOriginalState(extensionsHints);

        } catch (e) {

            throw e;

        }
    }


    public async getDndStatus(): Promise<DndExtensionsStatus> {
        try {

            const extensionnsItemsDndStatus: ExtensionsItemsDndStatus[] = [];

            const extensionsState = await this.getExtensionBusynessState();
            
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

    private formateExtensionBusynessState(event: AsteriskBaseStatusResponse<AsteriskExtensionStatusEvent[]> ): ActualExtensionBusynessState {

        const extensionsState: ExtensionBusynessState[] = [];

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

    private formateExtensionOriginalState(event: AsteriskBaseStatusResponse<AsteriskExtensionStatusEvent[]> ): ActualExtensionOriginalState {

        const extensionsState: ExtensionOriginalState[] = [];

        event.events.map((e: AsteriskExtensionStatusEvent) => {

            if (e.context !== 'ext-local') return;

            extensionsState.push({
                sip_id: e.exten,
                original_extension_state: e.statustext,
            });

        });

        return {
            items: extensionsState,
        };

    }
}