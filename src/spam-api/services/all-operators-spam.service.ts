import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { SpamApiService } from './spam-api.service';
import { BiglandService } from '@app/bigland/bigland.service';
import { OperatorsService } from '@app/operators/operators.service';
import { OperatorsInfo } from '@app/operators/interfaces/operators.interfaces';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { Spam, SpamCheckResult } from '../spam.schema';
import { REPORT_RESULT_SUB_TIMER } from '@app/reports/reports.constants';
import { DefaultApplicationApiStruct } from '@app/bigland/interfaces/bigland.interfaces';
import { SpamType } from '../interfaces/spam-api.enum';
import { SpamModelService } from './spam-model.service';
import { ApplicationApiActionStatus } from '@app/bigland/interfaces/bigland.enum';

@Injectable()
export class AllOperatorsSpamService {
  private applicationId: string;

  constructor(
    private readonly log: LogService,
    private readonly spamApiService: SpamApiService,
    private readonly spamModelService: SpamModelService,
    private readonly biglandService: BiglandService,
    private readonly operatorsService: OperatorsService,
  ) {}

  public async checkAllOperators(): Promise<DefaultApplicationApiStruct> {
    try {
      const actual = await this.spamApiService.isInitCheck(SpamType.checkAllOperators);
      if (actual.length !== 0) throw new Error(`Уже запущенна проверка в рамках ${actual[0].applicationId}`);

      const operatorsName = this.formatOperators(await this.getAllOperators());
      const defaultApiStruct = this.biglandService.getDefaultApiStruct();
      this._checkAllOperators(defaultApiStruct, operatorsName);
      return defaultApiStruct;
    } catch (e) {
      this.log.error(e, AllOperatorsSpamService.name);
      throw e;
    }
  }

  private async _checkAllOperators(defaultApiStruct: DefaultApplicationApiStruct, operatorsName: OperatorsName[]) {
    try {
      await this.spamModelService.create({
        ...defaultApiStruct,
        spamType: SpamType.checkAllOperators,
        checkDate: new Date(),
        resultSpamCheck: [],
      });
      await this._startCheckAllOperatorsReport(defaultApiStruct, operatorsName);
    } catch (e) {
      this.log.error(e, AllOperatorsSpamService.name);
    }
  }

  private async _startCheckAllOperatorsReport(
    defaultApiStruct: DefaultApplicationApiStruct,
    operatorsName: OperatorsName[],
  ): Promise<void> {
    try {
      const aggregateCheck: SpamCheckResult[] = [];
      let isCancel = false;
      for (const operatorName of operatorsName) {
        // При проверке каждогонового оператора проверяем не отменили ли саму проверку
        isCancel = await this.spamApiService.isCancel(defaultApiStruct.applicationId);
        if (isCancel) break;

        // Запускаем проверку по номерам оператора и добавляем уникальный ID проверки в общий связанный список
        const { applicationId } = await this.spamApiService.startCheckOperatorNumbers(operatorName, SpamType.checkOperatorNumbers);
        await this.addCheckSpamId(defaultApiStruct, applicationId);

        // Подписываемся на результат проверки по номерам оператора
        const result = await this.subscribeSpamCheck(applicationId);

        // В случае отмены проверки по номерам оператора, фильтруем номера вычлиняя те которые не успели проверить
        aggregateCheck.push(
          ...result.resultSpamCheck.map((item) => {
            const filteredNumbers = item.numbers.filter((number) => number.status);
            return { operator: item.operator, numbers: filteredNumbers };
          }),
        );
      }

      // Сохраняем итоговый результат или результат который успели получить до отмены
      await this.spamModelService.update(defaultApiStruct.applicationId, {
        status: isCancel ? ApplicationApiActionStatus.cancel : ApplicationApiActionStatus.completed,
        resultSpamCheck: aggregateCheck,
      });
    } catch (e) {
      this.log.error(e, AllOperatorsSpamService.name);
    }
  }

  private async addCheckSpamId(defaultApiStruct: DefaultApplicationApiStruct, applicationId: string): Promise<void> {
    const applicationIds: string[] = [];
    const allOperatorsCheck = await this.spamModelService.findByApplicationId(defaultApiStruct.applicationId);
    !!allOperatorsCheck.applicationIds
      ? applicationIds.push(...allOperatorsCheck.applicationIds, applicationId)
      : applicationIds.push(applicationId);
    await this.spamModelService.update(defaultApiStruct.applicationId, {
      applicationIds,
    });
  }

  private async subscribeSpamCheck(applicationId: string): Promise<Spam> {
    try {
      this.applicationId = applicationId;
      return await this.biglandService.subscribeApiResult<Spam>(this.getReportResult.bind(this), REPORT_RESULT_SUB_TIMER);
    } catch (e) {
      this.log.error(e, AllOperatorsSpamService.name);
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
