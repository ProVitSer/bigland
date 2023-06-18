import { CheckOperatorNumbersDTO } from '@app/asterisk-api/dto/check-spam.dto';
import { AsteriskApiStatusData, DefaultAsterisApiResponceStruct } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { AsteriskApiService } from '@app/asterisk-api/services';
import { LogService } from '@app/log/log.service';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { Injectable } from '@nestjs/common';
import * as json2xls from 'json2xls';
import { FileFormatType } from '@app/files-api/interfaces/files.enum';
import { SpamReportService } from '../spam-report.service';
import { ReportData, Report, GenerateReportData } from '../interfaces/report.interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MangoSpamReport implements Report {
  private asteriskApiId: string;
  private readonly operatorsName: OperatorsName = OperatorsName.mango;
  constructor(
    private readonly configService: ConfigService,
    private readonly log: LogService,
    private readonly asteriskApiService: AsteriskApiService,
  ) {}

  async getReportData(_: GenerateReportData): Promise<ReportData[]> {
    return await this.getMangoSpamReport();
  }

  private async getMangoSpamReport(): Promise<ReportData[]> {
    try {
      const { asteriskApiId } = await this.startCheck();
      this.asteriskApiId = asteriskApiId;
      const result = await SpamReportService.subscribeReposrtResult(this.getReportResult.bind(this), 10000);
      return [
        {
          buff: this.getBufferResult(result),
          outputFormat: FileFormatType.xls,
        },
      ];
    } catch (e) {
      this.log.error(e, MangoSpamReport.name);
    }
  }

  private getBufferResult(result: AsteriskApiStatusData) {
    const format = SpamReportService.formatReportData(result, this.operatorsName);
    const xls = json2xls(format);
    return Buffer.from(xls, 'binary');
  }

  private async startCheck(): Promise<DefaultAsterisApiResponceStruct> {
    const checkCriteria: CheckOperatorNumbersDTO = {
      operator: this.operatorsName,
      dstNumber: this.configService.get('reports.spam.verificationNumber'),
    };
    return await this.asteriskApiService.checkOperatorNumbers(checkCriteria);
  }

  private async getReportResult(): Promise<AsteriskApiStatusData> {
    return await this.asteriskApiService.getAsteriskApiStatus(this.asteriskApiId);
  }
}
