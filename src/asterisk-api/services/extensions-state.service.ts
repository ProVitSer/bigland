import { Injectable } from '@nestjs/common';
import { AmiActionService } from '@app/asterisk/ami/services/action-service';
import { ActualExtensionsState, ExtensionState } from '../interfaces/asterisk-api.interfaces';
import { AsteriskBaseStatusResponse, AsteriskExtensionStatusEvent } from '@app/asterisk/ami/interfaces/ami.interfaces';
import { HINT_STATE_TO_BUSYNESS_STATE } from '../asterisk-api.constants';
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

  private formateExtensionsState(event: AsteriskBaseStatusResponse<AsteriskExtensionStatusEvent[]>): ActualExtensionsState {
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
