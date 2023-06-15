import { SetDNDStatusResult } from '@app/asterisk/interfaces/asterisk.interfaces';
import { Injectable } from '@nestjs/common';
import { IDnd } from '../interfaces/asterisk-api.interfaces';
import { AmiActionService } from '@app/asterisk/ami/services/action-service';

@Injectable()
export class ServiceCodeApiService {
  constructor(private readonly ami: AmiActionService) {}

  public async setDndStatus(data: IDnd): Promise<SetDNDStatusResult> {
    try {
      return await this.ami.setDNDStatus(data);
    } catch (e) {
      throw e;
    }
  }
}
