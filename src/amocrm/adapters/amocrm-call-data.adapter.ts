import { AmocrmUsers } from '@app/amocrm-users/amocrm-users.schema';
import { AmocrmAddCallInfo, SendCallInfoToCRM } from '../interfaces/amocrm.interfaces';
import * as moment from 'moment';
import { CALL_DATE_SUBTRACT, CALL_DIRECTION_TYPE_MAP, CALL_STATUS_MAP, RECORD_PATH_FROMAT } from '../amocrm.constants';
import { UtilsService } from '@app/utils/utils.service';
import { CallType } from '@app/cdr/interfaces/cdr.enum';
import { ResponsibleUserId } from '../interfaces/amocrm.enum';

export class AmocrmCallDataAdapter {
    public amocrmRequestData: AmocrmAddCallInfo;
    private callDate: number;
    private amocrmUserId: number;

    constructor(data: SendCallInfoToCRM, amocrmUsers: AmocrmUsers[], recordUrl: string) {

        const cdr = data.asteriskCdrInfo;

        this.callDate = moment(cdr.calldate).subtract(CALL_DATE_SUBTRACT, 'hour').unix();

        this.amocrmUserId = this.getAmocrmUserId(data, amocrmUsers);

        this.amocrmRequestData = {
            direction: CALL_DIRECTION_TYPE_MAP[data.msg.callType],
            uniq: cdr.uniqueid,
            duration: cdr.billsec,
            source: 'amo_custom_widget',
            link: `${recordUrl}${moment(cdr.calldate).subtract(CALL_DATE_SUBTRACT, 'hour').format(RECORD_PATH_FROMAT)}/${cdr.recordingfile}`,
            phone: this.getPhone(data),
            call_result: '',
            call_status: CALL_STATUS_MAP[cdr.disposition],
            responsible_user_id: this.amocrmUserId || ResponsibleUserId.AdminCC,
            created_by: this.amocrmUserId || ResponsibleUserId.AdminCC,
            updated_by: this.amocrmUserId || ResponsibleUserId.AdminCC,
            created_at: this.callDate,
            updated_at: this.callDate,
        };
    }

    private getLocalExtension(data: SendCallInfoToCRM): string {

        const channel = data.msg.callType === CallType.incoming ? data.asteriskCdrInfo.dstchannel : data.asteriskCdrInfo.channel;

        return UtilsService.replaceChannel(channel);

    }

    private getAmocrmUserId(data: SendCallInfoToCRM, amocrmUsers: AmocrmUsers[]): number {

        const localExtension = this.getLocalExtension(data);

        if (!amocrmUsers.some((user: AmocrmUsers) => user.localExtension === Number(localExtension))) return ResponsibleUserId.AdminCC;

        return amocrmUsers.filter((amocrmUser: AmocrmUsers) => {
            return amocrmUser.localExtension === Number(localExtension);
        })[0].amocrmId;

    }

    private getPhone(data: SendCallInfoToCRM): string {

        return data.msg.callType === CallType.incoming ? data.asteriskCdrInfo.src : data.asteriskCdrInfo.dst;
        
    }
}