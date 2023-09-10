import { Injectable } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { UtilsService } from '@app/utils/utils.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueueTypes, RabbitMqExchange } from '@app/rabbit/interfaces/rabbit.enum';
import { DEFAULT_CDR_TIMEOUT } from '../cdr.constants';
import { Cdr, CdrDocument } from '../cdr.schema';
import { CdrService } from '../cdr.service';
import { CdrInfo } from '../interfaces/cdr.interfaces';

@Injectable()
export class CdrMessagingSubService {
  constructor(@InjectModel(Cdr.name) private cdrModel: Model<CdrDocument>, private readonly cdrService: CdrService) {}

  @RabbitSubscribe({
    exchange: RabbitMqExchange.presence,
    queue: QueueTypes.cdr,
    queueOptions: {
      channel: 'cdr',
    },
  })
  public async pubSubHandler(msg: CdrInfo): Promise<void | Nack> {
    try {
      await UtilsService.sleep(DEFAULT_CDR_TIMEOUT);
      if (await this.checkComplete(msg)) return;
      await this.cdrService.sendCdrInfo(msg.data as Cdr);
    } catch (e) {
      return;
    }
  }

  private async checkComplete(msg: CdrInfo): Promise<boolean> {
    const cdr = await this.cdrModel.find({ uniqueid: msg.data.uniqueid });
    return cdr[0].complete;
  }
}
