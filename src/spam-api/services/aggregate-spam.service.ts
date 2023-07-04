import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { SpamApiService } from '../services/spam-api.service';
import { BiglandService } from '@app/bigland/bigland.service';
import { OperatorsService } from '@app/operators/operators.service';
import { OperatorsInfo } from '@app/operators/interfaces/operators.interfaces';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { Spam, SpamCheckResult } from '../spam.schema';
import { REPORT_RESULT_SUB_TIMER } from '@app/reports/reports.constants';
import { DefaultApplicationApiStruct } from '@app/bigland/interfaces/bigland.interfaces';
import { SpamType } from '../interfaces/spam-api.enum';
import { ApplicationApiActionStatus } from '@app/bigland/interfaces/bigland.enum';
import { SpamReportService } from '../services/spam-report.service';
import { SpamModelService } from '../services/spam-model.service';

@Injectable()
export class AggregatedSpamService {
  private applicationId: string;

  constructor(
    private readonly log: LogService,
    private readonly spamApiService: SpamApiService,
    private readonly spamReportService: SpamReportService,
    private readonly spamModelService: SpamModelService,
    private readonly biglandService: BiglandService,
    private readonly operatorsService: OperatorsService,
  ) {}

  public async aggregateScheduleReport() {
    try {
      const operatorsName = this.formatOperators(await this.getAllOperators());
      const defaultApiStruct = this.biglandService.getDefaultApiStruct();
      const resultSpamCheck = await this._startAggregateReport(operatorsName);
      await this.saveAggregateInfo(defaultApiStruct, SpamType.allOperators, resultSpamCheck);
    } catch (e) {
      this.log.error(e, AggregatedSpamService.name);
    }
  }

  public async aggregateApiReport(): Promise<DefaultApplicationApiStruct> {
    try {
      const operatorsName = this.formatOperators(await this.getAllOperators());
      const defaultApiStruct = this.biglandService.getDefaultApiStruct();
      this._aggregateApiReport(defaultApiStruct, operatorsName);
      return defaultApiStruct;
    } catch (e) {
      this.log.error(e, AggregatedSpamService.name);
    }
  }

  private async _aggregateApiReport(defaultApiStruct: DefaultApplicationApiStruct, operatorsName: OperatorsName[]) {
    try {
      await this.spamModelService.create({
        ...defaultApiStruct,
        spamType: SpamType.allOperators,
        checkDate: new Date(),
        resultSpamCheck: [],
      });
      const resultSpamCheck = await this._startAggregateReport(operatorsName);
      await this.spamModelService.update(defaultApiStruct.applicationId, { status: ApplicationApiActionStatus.completed, resultSpamCheck });
    } catch (e) {
      this.log.error(e, AggregatedSpamService.name);
    }
  }

  private async _startAggregateReport(operatorsName: OperatorsName[]): Promise<SpamCheckResult[]> {
    try {
      const aggregateCheck: SpamCheckResult[] = [];
      for (const operatorName of operatorsName) {
        const result = await this.startCheckSpam(operatorName);
        aggregateCheck.push(...result.resultSpamCheck);
      }
      return aggregateCheck;
    } catch (e) {
      this.log.error(e, AggregatedSpamService.name);
    }
  }

  private async saveAggregateInfo(
    defaultApiStruct: DefaultApplicationApiStruct,
    spamType: SpamType,
    resultSpamCheck: SpamCheckResult[],
  ): Promise<void> {
    await this.spamModelService.create({
      ...defaultApiStruct,
      status: ApplicationApiActionStatus.completed,
      spamType,
      checkDate: new Date(),
      resultSpamCheck,
    });
  }

  private async startCheckSpam(operatorsName: OperatorsName): Promise<Spam> {
    try {
      const { applicationId } = await this.spamReportService.startSpamCheck(operatorsName);
      this.applicationId = applicationId;
      return await this.biglandService.subscribeApiResult<Spam>(this.getReportResult.bind(this), REPORT_RESULT_SUB_TIMER);
    } catch (e) {
      this.log.error(e, AggregatedSpamService.name);
    }
  }

  private async getAllOperators(): Promise<OperatorsInfo[]> {
    return this.operatorsService.getOperators();
  }

  private formatOperators(operators: OperatorsInfo[]): OperatorsName[] {
    return operators.map((operator: OperatorsInfo) => operator.name);
  }

  private async getReportResult(): Promise<Spam> {
    return await this.spamApiService.getSpamApplicationStatus(this.applicationId);
  }
}
