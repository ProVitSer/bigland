import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AsteriskCdr } from './asterisk-cdr.entity';
import { Op } from 'sequelize';
import {
  ASTERISK_CDR_INCOMING_CALL_ERROR,
  ASTERISK_CDR_OUTGOING_CALL_ERROR,
  ASTERISK_CDR_POZVONIM_CALL_ERROR,
} from './asterisk-cdr.constants';

@Injectable()
export class AsteriskCdrService {
  constructor(
    @InjectModel(AsteriskCdr)
    private getCallInfo: typeof AsteriskCdr,
    private readonly log: LogService,
  ) {}

  public async searchIncomingCallInfoInCdr(uniqueid: string): Promise<AsteriskCdr[]> {
    try {
      this.log.info(`Входящий вызов ${uniqueid}`, AsteriskCdrService.name);
      const result = await this.getCallInfo.findAll({
        raw: true,
        where: {
          uniqueid: {
            [Op.like]: uniqueid,
          },
        },
        order: [['billsec', 'DESC']],
      });

      this.log.info(result, AsteriskCdrService.name);
      return result;
    } catch (e) {
      this.log.error(`${ASTERISK_CDR_INCOMING_CALL_ERROR}: ${e}`, AsteriskCdrService.name);
      return;
    }
  }

  public async searchOutgoingCallInfoInCdr(uniqueid: string): Promise<AsteriskCdr[]> {
    try {
      this.log.info(`Исходящий вызов ${uniqueid}`, AsteriskCdrService.name);

      const result = await this.getCallInfo.findAll({
        raw: true,
        where: {
          uniqueid: {
            [Op.like]: uniqueid,
          },
          dcontext: {
            [Op.like]: 'from-internal',
          },
        },
      });

      this.log.info(result, AsteriskCdrService.name);
      return result;
    } catch (e) {
      this.log.error(`${ASTERISK_CDR_OUTGOING_CALL_ERROR}: ${e}`, AsteriskCdrService.name);
      return;
    }
  }

  public async searchPozvonimCallInfoInCdr(uniqueid: string): Promise<AsteriskCdr[]> {
    try {
      this.log.info(`Исходящий вызов Pozvonim ${uniqueid}`, AsteriskCdrService.name);
      const newUniqueid = uniqueid.substring(0, uniqueid.length - 5);
      const result = await this.getCallInfo.findAll({
        raw: true,
        where: {
          uniqueid: {
            [Op.like]: `${newUniqueid}%`,
          },
          dcontext: {
            [Op.like]: 'outrt-pozvonim',
          },
        },
      });

      this.log.info(result, AsteriskCdrService.name);
      return result;
    } catch (e) {
      this.log.error(`${ASTERISK_CDR_POZVONIM_CALL_ERROR}: ${e}`, AsteriskCdrService.name);
      return;
    }
  }
}
