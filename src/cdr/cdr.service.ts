import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cdr, CdrDocument } from './cdr.schema';
import { Model, ObjectId } from 'mongoose';
import { CallType } from './interfaces/cdr.enum';
import { LogService } from '@app/log/log.service';
import { AsteriskCdrService } from '@app/asterisk-cdr/asterisk-cdr.service';
import { AsteriskCdr } from '@app/asterisk-cdr/asterisk-cdr.entity';
import { AmocrmService } from '@app/amocrm/amocrm.service';
import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { UtilsService } from '@app/utils/utils.service';
import { directionType } from '@app/amocrm/interfaces/amocrm.interfaces';

@Injectable()
export class CdrService {
  constructor(
    @InjectModel(Cdr.name) private cdrModel: Model<CdrDocument>,
    private readonly asteriskCdrService: AsteriskCdrService,
    private readonly amocrmService: AmocrmService,
    private readonly amocrmUsersService: AmocrmUsersService,
    private readonly log: LogService,
  ) {}

  public async sendCdrInfo(msg: Cdr) {
    try {
      this.log.info(msg, CdrService.name);
      let asteriskCdrInfo: AsteriskCdr[] | AsteriskCdr = [];
      switch (msg.callType) {
        case CallType.incoming:
          asteriskCdrInfo =
            await this.asteriskCdrService.searchIncomingCallInfoInCdr(
              msg.unicueid,
            );
          await this.sendInfoToAmo(
            asteriskCdrInfo,
            directionType.inbound,
            msg._id,
          );
          break;
        case CallType.outgoing:
          asteriskCdrInfo =
            await this.asteriskCdrService.searchOutgoingCallInfoInCdr(
              msg.unicueid,
            );
          await this.sendInfoToAmo(
            [asteriskCdrInfo],
            directionType.outbound,
            msg._id,
          );
          break;
        case CallType.pozvonim:
          asteriskCdrInfo =
            await this.asteriskCdrService.searchPozvonimCallInfoInCdr(
              msg.unicueid,
            );
          await this.sendInfoToAmo(
            [asteriskCdrInfo],
            directionType.outbound,
            msg._id,
          );
          break;
        default:
          this.log.error(JSON.stringify(msg), CdrService.name);
          break;
      }
    } catch (e) {
      this.log.error(`${e}: ${JSON.stringify(msg)}`, CdrService.name);
    }
  }

  private async sendInfoToAmo(
    cdr: AsteriskCdr[],
    callType: directionType,
    cdrId: ObjectId,
  ) {
    await Promise.all(
      cdr.map(async (c: AsteriskCdr) => {
        const amocrmUser = await this.amocrmUsersService.getAmocrmUser(
          UtilsService.replaceChannel(c.channel || c.dstchannel),
        );
        await this.amocrmService.sendCallInfoToCRM({
          cdrId,
          result: c,
          amocrmId: amocrmUser[0]?.amocrmId,
          direction: callType,
        });
        await this.cdrCallComplite(cdrId);
      }),
    );
  }

  private async cdrCallComplite(cdrId: ObjectId) {
    return await this.cdrModel.findOneAndUpdate(
      { _id: cdrId },
      { $set: { complete: true } },
    );
  }
}
