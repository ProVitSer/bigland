import { Amocrm, AmocrmDocument } from '@app/amocrm/amocrm.schema';
import { DEFAULT_TIMEOUT_HANDLER } from '@app/asterisk/asterisk.config';
import { LogService } from '@app/log/log.service';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Cdr, CdrDocument } from '../cdr.schema';
import { CdrService } from '../cdr.service';
import { Disposition } from '../interfaces/cdr.enum';
import * as moment from 'moment';

@Injectable()
export class CdrSchedule {
  constructor(
    @InjectModel(Cdr.name) private cdrModel: Model<CdrDocument>,
    @InjectModel(Amocrm.name) private amocrmModel: Model<AmocrmDocument>,

    private readonly cdrService: CdrService,
    private readonly log: LogService,
  ) {}

  // @Timeout(30000)
  // async updateNoCompleteCall() {
  //   try {
  //     const criteria = {
  //       stamp: {
  //         $gte: moment().subtract(1, 'days').startOf('day'),
  //         $lt: moment().endOf('day'),
  //       },
  //       'amocrmResponseData.errors': {
  //         $elemMatch: {
  //           status: 263,
  //         },
  //       },
  //     };
  //     const amocrmInfo = await this.amocrmModel.find(criteria);
  //     for (const cdr of amocrmInfo) {
  //       await UtilsService.sleep(DEFAULT_TIMEOUT_HANDLER);
  //       const noSendCdr = await this.cdrModel.findById(cdr.cdrId);
  //       await this.cdrService.sendCdrInfo(noSendCdr);
  //     }
  //   } catch (e) {
  //     this.log.error(e, CdrSchedule.name);
  //   }
  // }
}
