import { Injectable } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Cdr, CdrDocument } from './cdr.schema';
import { CdrService } from './cdr.service';
import { UtilsService } from '@app/utils/utils.service';
import { QueueTypes } from './interfaces/cdr.enum';
import { DEFAULT_TIMEOUT } from './cdr.config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CdrPubSubInfo } from './interfaces/cdr.interfaces';

@Injectable()
export class CdrMessagingService {
  constructor(@InjectModel(Cdr.name) private cdrModel: Model<CdrDocument>, private readonly cdrService: CdrService) {}

  @RabbitSubscribe({
    exchange: 'presence',
    queue: QueueTypes.cdr,
  })
  public async pubSubHandler(msg: CdrPubSubInfo): Promise<void | Nack> {
    try {
      await UtilsService.sleep(DEFAULT_TIMEOUT);
      if (await this.checkComplete(msg)) return;
      await this.cdrService.sendCdrInfo(msg.data as Cdr);
    } catch (e) {
      return new Nack(true);
    }
  }

  private async checkComplete(msg: CdrPubSubInfo): Promise<boolean> {
    const cdr = await this.cdrModel.find({ unicueid: msg.data.unicueid });
    return cdr[0].complete;
  }
}
