import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cdr, CdrDocument } from './cdr.schema';
import { Model, ObjectId } from 'mongoose';
import { CallType } from './interfaces/cdr.enum';
import { LogService } from '@app/log/log.service';
import { AsteriskCdrService } from '@app/asterisk-cdr/asterisk-cdr.service';
import { AsteriskCdr } from '@app/asterisk-cdr/asterisk-cdr.entity';
import { AmocrmV4Service } from '@app/amocrm/v4/amocrm-v4.service';
import { UtilsService } from '@app/utils/utils.service';

@Injectable()
export class CdrService {
  constructor(
    @InjectModel(Cdr.name) private cdrModel: Model<CdrDocument>,
    private readonly asteriskCdrService: AsteriskCdrService,
    private readonly amocrmV4Service: AmocrmV4Service,
    private readonly log: LogService,
  ) {}

  public async sendCdrInfo(msg: Cdr) {
    try {
      this.log.info(msg, CdrService.name);
      let asteriskCdrInfo: AsteriskCdr[] = [];
      switch (msg.callType) {
        case CallType.incoming:
          asteriskCdrInfo = await this.asteriskCdrService.searchIncomingCallInfoInCdr(msg.uniqueid);
          await this.sendInfoToAmo(asteriskCdrInfo, msg);
          break;
        case CallType.outgoing:
          asteriskCdrInfo = await this.asteriskCdrService.searchOutgoingCallInfoInCdr(msg.uniqueid);
          await this.sendInfoToAmo(asteriskCdrInfo, msg);
          break;
        case CallType.pozvonim:
          asteriskCdrInfo = await this.asteriskCdrService.searchPozvonimCallInfoInCdr(msg.uniqueid);
          await this.sendInfoToAmo(asteriskCdrInfo, msg);
          break;
        default:
          this.log.error(JSON.stringify(msg), CdrService.name);
          break;
      }
    } catch (e) {
      this.log.error(e.data || e, CdrService.name);
      this.log.error(msg, CdrService.name);
      throw e;
    }
  }

  private async sendInfoToAmo(cdr: AsteriskCdr[], msg: Cdr) {
    this.log.info(cdr, CdrService.name);
    if (cdr.length == 0) return;
    for (const c of cdr) {
      await UtilsService.sleep(500);
      await this.amocrmV4Service.sendCallInfoToCRM({
        msg,
        asteriskCdrInfo: c,
      });
      await this.cdrCallComplite(msg._id, c);
    }
  }

  private async cdrCallComplite(cdrId: ObjectId, cdrData: AsteriskCdr) {
    this.log.info(cdrData, CdrService.name);
    return await this.cdrModel.findOneAndUpdate({ _id: cdrId }, { $set: { complete: true } });
  }
}
