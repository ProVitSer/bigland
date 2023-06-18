import { AsteriskApiActionStatus } from '@app/asterisk-api/interfaces/asterisk-api.enum';
import { AsteriskApiStatusData } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { distinctUntilChanged } from 'rxjs';
import { REPORT_DATE_FORMAT, SPAM_STATUS_DESCRIPTION } from './reports.constants';
import * as moment from 'moment';

@Injectable()
export class SpamReportService {
  static async subscribeReposrtResult(fn: () => Promise<any>, timeout: number): Promise<AsteriskApiStatusData> {
    return new Promise((resolve, reject) => {
      const subscriber = UtilsService.getObservableFn(fn, timeout)
        .pipe(
          distinctUntilChanged((prev: AsteriskApiStatusData, current: AsteriskApiStatusData) => {
            return prev.status === current.status;
          }),
        )
        .subscribe({
          next: async (res: AsteriskApiStatusData) => {
            switch (res.status) {
              case AsteriskApiActionStatus.completed:
                subscriber.unsubscribe();
                resolve(res);
                break;
              case AsteriskApiActionStatus.inProgress:
                break;
              case AsteriskApiActionStatus.apiFail:
                subscriber.unsubscribe();
                reject(res);
                break;
            }
          },
          error: (e: unknown) => {
            subscriber.unsubscribe();
            reject(e);
          },
        });
    });
  }

  static formatReportData(data: AsteriskApiStatusData, operatorsName: OperatorsName) {
    return data.numbersInfo.map((item) => {
      return {
        Дата: moment().format(REPORT_DATE_FORMAT),
        Оператор: operatorsName,
        Номер: item.number,
        'Результат проверки': SPAM_STATUS_DESCRIPTION[item.spamStatus],
      };
    });
  }
}
