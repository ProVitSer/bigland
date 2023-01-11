import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Cdr } from './cdr.schema';
import { CdrService } from './cdr.service';
import { UtilsService } from '@app/utils/utils.service';
import { QueueTypes } from './interfaces/cdr.enum';
import { DEFAULT_TIMEOUT } from './cdr.config';

@Injectable()
export class CdrMessagingService {
  constructor(private readonly cdrService: CdrService) {}
  @RabbitSubscribe({
    exchange: 'presence',
    queue: QueueTypes.cdr,
  })
  public async pubSubHandler(msg: any) {
    await UtilsService.sleep(DEFAULT_TIMEOUT);
    await this.cdrService.sendCdrInfo(msg.data as Cdr);
  }
}
