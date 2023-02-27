import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cdr, CdrDocument } from './cdr.schema';
import { Model, ObjectId } from 'mongoose';
import { CallType } from './interfaces/cdr.enum';
import { LogService } from '@app/log/log.service';
import { AsteriskCdrService } from '@app/asterisk-cdr/asterisk-cdr.service';
import { AsteriskCdr } from '@app/asterisk-cdr/asterisk-cdr.entity';
import { AmocrmV4Service } from '@app/amocrm/amocrm.service';
import { AmocrmUsersService } from '@app/amocrm-users/amocrm-users.service';
import { UtilsService } from '@app/utils/utils.service';
import { DirectionType } from '@app/amocrm/interfaces/amocrm.enum';

@Injectable()
export class CdrService {
  constructor(
    @InjectModel(Cdr.name) private cdrModel: Model<CdrDocument>,
    private readonly asteriskCdrService: AsteriskCdrService,
    private readonly amocrmV4Service: AmocrmV4Service,
    private readonly amocrmUsersService: AmocrmUsersService,
    private readonly log: LogService,
  ) {}

  public async sendCdrInfo(msg: Cdr) {
    try {
      this.log.info(msg, CdrService.name);
      let asteriskCdrInfo: AsteriskCdr[] | AsteriskCdr = [];
      switch (msg.callType) {
        case CallType.incoming:
          asteriskCdrInfo = await this.asteriskCdrService.searchIncomingCallInfoInCdr(msg.unicueid);
          await this.sendInfoToAmo(asteriskCdrInfo, DirectionType.inbound, msg._id);
          break;
        case CallType.outgoing:
          asteriskCdrInfo = await this.asteriskCdrService.searchOutgoingCallInfoInCdr(msg.unicueid);
          await this.sendInfoToAmo([asteriskCdrInfo], DirectionType.outbound, msg._id);
          break;
        case CallType.pozvonim:
          asteriskCdrInfo = await this.asteriskCdrService.searchPozvonimCallInfoInCdr(msg.unicueid);
          await this.sendInfoToAmo([asteriskCdrInfo], DirectionType.outbound, msg._id);
          break;
        default:
          this.log.error(JSON.stringify(msg), CdrService.name);
          break;
      }
    } catch (e) {
      this.log.error(`${e}: ` + msg, CdrService.name);
    }
  }

  private async sendInfoToAmo(cdr: AsteriskCdr[], callType: DirectionType, cdrId: ObjectId) {
    await Promise.all(
      cdr.map(async (c: AsteriskCdr) => {
        const amocrmUser = await this.amocrmUsersService.getAmocrmUser(UtilsService.replaceChannel(c.channel || c.dstchannel));
        await this.amocrmV4Service.sendCallInfoToCRM({
          cdrId,
          result: c,
          amocrmId: amocrmUser[0]?.amocrmId,
          direction: callType,
        });
        await this.cdrCallComplite(cdrId, c);
      }),
    );
  }

  private async cdrCallComplite(cdrId: ObjectId, cdrData: AsteriskCdr) {
    return await this.cdrModel.findOneAndUpdate({ _id: cdrId }, { $set: { complete: true, cdrData } });
  }
}
