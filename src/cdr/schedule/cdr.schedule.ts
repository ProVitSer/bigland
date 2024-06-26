import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cdr, CdrDocument } from '../cdr.schema';
import { CdrService } from '../cdr.service';
import { Disposition } from '../interfaces/cdr.enum';
import * as moment from 'moment';

@Injectable()
export class CdrSchedule {
    constructor(
        @InjectModel(Cdr.name) private cdrModel: Model < CdrDocument > ,
        private readonly cdrService: CdrService,
        private readonly log: LogService,
    ) {}

    //@Cron(CronExpression.EVERY_DAY_AT_10PM)
    async updateNoCompleteCall() {
        try {

            const criteria = {
                stamp: {
                    $gte: moment().subtract(1, 'days').startOf('day'),
                    $lt: moment().endOf('day'),
                },
                complete: false,
                disposition: {
                    $ne: Disposition.failed,
                },
            };

            const noCompleteCdr = await this.cdrModel.find(criteria);

            if (noCompleteCdr.length == 0) return;

            this.log.info(noCompleteCdr, CdrSchedule.name);

        } catch (e) {

            this.log.error(e, CdrSchedule.name);
            
        }
    }
}