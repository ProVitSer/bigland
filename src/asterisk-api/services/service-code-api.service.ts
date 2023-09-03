import { Injectable } from '@nestjs/common';
import { DndData } from '../interfaces/asterisk-api.interfaces';
import { AmiActionService } from '@app/asterisk/ami/services/action-service';
import { SetDNDStatusResult } from '@app/asterisk/ami/interfaces/ami.interfaces';

@Injectable()
export class ServiceCodeApiService {
  constructor(private readonly ami: AmiActionService) {}

  public async setDndStatus(data: DndData): Promise<SetDNDStatusResult> {
    try {
      return await this.ami.setDNDStatus(data);
    } catch (e) {
      throw e;
    }
  }
}
