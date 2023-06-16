import { CheckOperatorNumbersDTO } from '@app/asterisk-api/dto/check-spam.dto';
import { AsteriskApiActionStatus } from '@app/asterisk-api/interfaces/asterisk-api.enum';
import { AsteriskApiStatusData, DefaultAsterisApiResponceStruct } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { AsteriskApiService } from '@app/asterisk-api/services';
import { LogService } from '@app/log/log.service';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { distinctUntilChanged } from 'rxjs/operators';
import { SPAM_STATUS_DESCRIPTION } from '../report.constants';
import { FilesCreateService } from '@app/files-api/files-create/files-create.service';
import * as json2xls from 'json2xls';
import { FileFormatType } from '@app/files-api/interfaces/files.enum';

@Injectable()
export class MangoSpamReportService {
  private asteriskApiId: string;
  constructor(
    private readonly log: LogService,
    private readonly asteriskApiService: AsteriskApiService,
    private readonly filesCreate: FilesCreateService,
  ) {}

  @Timeout(10000)
  async getMangoSpamReport() {
    if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 0) {
      try {
        const { asteriskApiId } = await this.startCheck();
        this.asteriskApiId = asteriskApiId;
        const result = await this.subscribeReposrtResult();
        const format = this.formatReportData(result);
        const xls = json2xls(format);
        const buf = Buffer.from(xls, 'binary');
        const file = this.filesCreate.createFileFromBuffer(buf, FileFormatType.xls);
      } catch (e) {
        this.log.error(e, MangoSpamReportService.name);
      }
    }
  }

  private formatReportData(data: AsteriskApiStatusData) {
    return data.numbersInfo.map((item) => {
      return {
        Оператор: 'mango',
        Номер: item.number,
        'Результат проверки': SPAM_STATUS_DESCRIPTION[item.spamStatus],
      };
    });
  }

  private async startCheck(): Promise<DefaultAsterisApiResponceStruct> {
    const checkCriteria: CheckOperatorNumbersDTO = {
      operator: OperatorsName.mango,
      dstNumber: 'XXXXXXXXXXXXX',
    };
    return await this.asteriskApiService.checkOperatorNumbers(checkCriteria);
  }

  private async getReportResult(): Promise<AsteriskApiStatusData> {
    return await this.asteriskApiService.getAsteriskApiStatus(this.asteriskApiId);
  }

  private async subscribeReposrtResult(): Promise<AsteriskApiStatusData> {
    return new Promise((resolve, reject) => {
      const subscriber = UtilsService.getObservableFn(this.getReportResult.bind(this), 10000)
        .pipe(
          distinctUntilChanged((prev: AsteriskApiStatusData, current: AsteriskApiStatusData) => {
            console.log(JSON.stringify(current));
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
}
