import { Injectable } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Cdr, CdrDocument } from './cdr.schema';
import { CdrService } from './cdr.service';
import { UtilsService } from '@app/utils/utils.service';
import { MQExchange, MQQueue } from './interfaces/cdr.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CdrPubSubInfo } from './interfaces/cdr.interfaces';
import { DEFAULT_CDR_TIMEOUT } from './cdr.constants';

@Injectable()
export class CdrMessagingService {
  constructor(@InjectModel(Cdr.name) private cdrModel: Model<CdrDocument>, private readonly cdrService: CdrService) {}

  @RabbitSubscribe({
    exchange: MQExchange.presence,
    queue: MQQueue.cdr,
  })
  public async pubSubHandler(msg: CdrPubSubInfo): Promise<void | Nack> {
    try {
      await UtilsService.sleep(DEFAULT_CDR_TIMEOUT);
      if (await this.checkComplete(msg)) return;
      await this.cdrService.sendCdrInfo(msg.data as Cdr);
    } catch (e) {
      return;
    }
  }

  private async checkComplete(msg: CdrPubSubInfo): Promise<boolean> {
    const cdr = await this.cdrModel.find({ uniqueid: msg.data.uniqueid });
    return cdr[0].complete;
  }
}
