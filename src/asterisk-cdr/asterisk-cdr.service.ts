import { LogService } from '@app/log/log.service';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AsteriskCdr } from './asterisk-cdr.entity';
import { Op } from 'sequelize';

@Injectable()
export class AsteriskCdrService {
  constructor(
    @InjectModel(AsteriskCdr)
    private getCallInfo: typeof AsteriskCdr,
    private readonly log: LogService,
  ) {}

  public async searchIncomingCallInfoInCdr(
    uniqueid: string,
  ): Promise<AsteriskCdr[]> {
    try {
      this.log.info(`Входящий вызов ${uniqueid}`, AsteriskCdrService.name);
      const resultFind = await this.getCallInfo.findAll({
        raw: true,
        attributes: [
          'calldate',
          'src',
          'dcontext',
          'dstchannel',
          'billsec',
          'disposition',
          'uniqueid',
          'recordingfile',
        ],
        where: {
          uniqueid: {
            [Op.like]: uniqueid,
          },
        },
        order: [['billsec', 'DESC']],
      });

      // const filterResult = resultFind.filter((cdr: Cdr) => cdr.disposition === 'ANSWERED');
      const result = await Promise.all(
        resultFind.map(async (asteriskCdr: AsteriskCdr) => {
          if (UtilsService.isGsmChannel(asteriskCdr.dstchannel)) {
            return await this.searchIncomingCallByLinkedid(
              asteriskCdr.uniqueid,
            );
          } else {
            return asteriskCdr;
          }
        }),
      );
      this.log.info(result, AsteriskCdrService.name);
      return result;
    } catch (e) {
      this.log.error(
        `searchIncomingCallInfoInCdr ${e}`,
        AsteriskCdrService.name,
      );
      return;
    }
  }

  public async searchOutgoingCallInfoInCdr(
    uniqueid: string,
  ): Promise<AsteriskCdr> {
    try {
      this.log.info(`Исходящий вызов ${uniqueid}`, AsteriskCdrService.name);

      const result = await this.getCallInfo.findAll({
        raw: true,
        attributes: [
          'calldate',
          'dst',
          'channel',
          'dcontext',
          'billsec',
          'disposition',
          'uniqueid',
          'recordingfile',
        ],
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

      if (result.length !== 0) {
        return result[0];
      } else {
        return result[0];
      }
    } catch (e) {
      this.log.error(
        `searchOutgoingCallInfoInCdr ${e}`,
        AsteriskCdrService.name,
      );
      return;
    }
  }

  public async searchPozvonimCallInfoInCdr(
    uniqueid: string,
  ): Promise<AsteriskCdr> {
    try {
      this.log.info(
        `Исходящий вызов Pozvonim ${uniqueid}`,
        AsteriskCdrService.name,
      );
      const newUniqueid = uniqueid.substring(0, uniqueid.length - 5);
      const result = await this.getCallInfo.findAll({
        raw: true,
        attributes: [
          'calldate',
          'dst',
          'channel',
          'dcontext',
          'billsec',
          'disposition',
          'uniqueid',
          'recordingfile',
        ],
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

      if (result.length !== 0) {
        return result[0];
      } else {
        return result[0];
      }
    } catch (e) {
      this.log.error(
        `searchPozvonimCallInfoInCdr ${e}`,
        AsteriskCdrService.name,
      );
      return;
    }
  }

  public async searchIncomingCallByLinkedid(
    uniqueid: string,
  ): Promise<AsteriskCdr> {
    try {
      this.log.info(`Входящий вызов GSM ${uniqueid}`, AsteriskCdrService.name);
      const resultFind = await this.getCallInfo.findAll({
        raw: true,
        attributes: [
          'calldate',
          'src',
          'dcontext',
          'dstchannel',
          'billsec',
          'disposition',
          'uniqueid',
          'recordingfile',
        ],
        where: {
          linkedid: {
            [Op.like]: uniqueid,
          },
        },
        order: [['billsec', 'DESC']],
      });

      const result = resultFind.filter((asteriskCdr: AsteriskCdr) =>
        UtilsService.checkDstChannel(asteriskCdr.dstchannel),
      );
      this.log.info(result, AsteriskCdrService.name);
      return result[0];
    } catch (e) {
      this.log.error(
        `searchIncomingCallByLinkedid ${e}`,
        AsteriskCdrService.name,
      );
      return;
    }
  }
}
