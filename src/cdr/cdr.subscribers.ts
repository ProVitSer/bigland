import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Cdr } from './cdr.schema';
import { CdrService } from './cdr.service';
import { UtilsService } from '@app/utils/utils.service';

@Injectable()
export class CdrMessagingService {
  constructor(private readonly cdrService: CdrService) {}
  @RabbitSubscribe({
    exchange: 'presence',
    queue: 'cdr',
  })
  public async pubSubHandler(msg: any) {
    await UtilsService.sleep(20000);
    await this.cdrService.sendCdrInfo(msg.data as Cdr);
  }
}
