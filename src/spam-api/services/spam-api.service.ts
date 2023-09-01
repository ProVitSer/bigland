import { BiglandService } from '@app/bigland/bigland.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CheckNumberDTO, CheckOperatorNumbersDTO } from '../dto/check-spam.dto';
import { CheckSpamCallResultDTO } from '../dto/amd-spam-call-result.dto';
import { Spam } from '../spam.schema';
import { AriCallService } from '@app/asterisk/ari/ari-call.service';
import { OperatorsService } from '@app/operators/operators.service';
import {
  CheckNumberSpamData,
  CheckOperatorSpamData,
  FormatSpamUpdateData,
  SaveCheckNumberData,
  SpamReportsResponseStruct,
} from '../interfaces/spam-api.interfaces';
import { ApplicationApiActionStatus } from '@app/bigland/interfaces/bigland.enum';
import { UtilsService } from '@app/utils/utils.service';
import { SEND_CALL_CHECK_SPAM } from '@app/asterisk-api/asterisk-api.constants';
import { AriCallType, AsteriskDialStatus } from '@app/asterisk/ari/interfaces/ari.enum';
import { DefaultApplicationApiStruct } from '@app/bigland/interfaces/bigland.interfaces';
import { AMD_STATUS_TO_SPAM_MAP } from '../spam-api.constants';
import { CheckSpamStatus, SpamType } from '../interfaces/spam-api.enum';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { NumbersInfo, Operators } from '@app/operators/operators.schema';
import { SpamModelService } from './spam-model.service';
import { SpamDataAdapter } from '../adapters/spam-data.adapter';
import { ConfigService } from '@nestjs/config';
import { CheckBatchDTO } from '../dto/check-batch.dto';
import { CheckBatchOperatorAdapter } from '../adapters/chack-batch-operator.adapter';
import { ReportsEnviromentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class SpamApiService {
  private reportsConfig = this.configService.get<ReportsEnviromentVariables>('reports');

  constructor(
    private readonly biglandService: BiglandService,
    private readonly ari: AriCallService,
    private readonly operatorsService: OperatorsService,
    private readonly spamModelService: SpamModelService,
    private readonly configService: ConfigService,
  ) {}

  public async startCheckOperatorNumbers(
    operatorsName: OperatorsName,
    spamType: SpamType,
    verificationNumber?: string,
  ): Promise<DefaultApplicationApiStruct> {
    try {
      const checkCriteria: CheckOperatorNumbersDTO = {
        operator: operatorsName,
        dstNumber: verificationNumber || this.reportsConfig.spam.verificationNumber,
      };
      return await this.checkOperatorNumbers(checkCriteria, spamType);
    } catch (e) {
      throw e;
    }
  }

  public async checkBatch(data: CheckBatchDTO): Promise<DefaultApplicationApiStruct> {
    try {
      const actual = await this.isInitCheck(SpamType.checkBatch);
      if (actual.length !== 0) throw new Error(`Уже запущенна проверка в рамках ${actual[0].applicationId}`);

      const defaultApiStruct = this.biglandService.getDefaultApiStruct();
      const fakeOperator = await this.getFakeOperatorInfo(data);
      await this.saveCheckNumberInfo({
        defaultApiStruct,
        operator: data.operator,
        numbers: fakeOperator.numbers.map((number) => {
          return { number: number.callerId };
        }),
        spamType: SpamType.checkBatch,
      });
      this._checkBatch(fakeOperator, defaultApiStruct);
      return defaultApiStruct;
    } catch (e) {
      throw e;
    }
  }

  private async _checkBatch(operatorInfo: Operators, defaultApiStruct: DefaultApplicationApiStruct): Promise<void> {
    this._checkOperatorNumbers(
      {
        dstNumber: this.reportsConfig.spam.verificationNumber,
        operator: operatorInfo.name,
        applicationId: defaultApiStruct.applicationId,
      },
      operatorInfo,
    );
  }

  private async getFakeOperatorInfo(data: CheckBatchDTO): Promise<Operators> {
    const operatorInfo = await this.operatorsService.getOperator(data.operator);
    const newOperatorInfo = new CheckBatchOperatorAdapter(data, operatorInfo);
    return newOperatorInfo.operatorInfo;
  }

  public async checkOperatorNumbers(data: CheckOperatorNumbersDTO, spamType: SpamType): Promise<DefaultApplicationApiStruct> {
    const actual = await this.isInitCheck(SpamType.checkOperatorNumbers);
    if (actual.length !== 0) throw new Error(`Уже запущенна проверка в рамках ${actual[0].applicationId}`);

    const defaultApiStruct = this.biglandService.getDefaultApiStruct();

    const operatorInfo = await this.operatorsService.getOperator(data.operator);

    await this.saveCheckNumberInfo({
      defaultApiStruct,
      operator: data.operator,
      numbers: operatorInfo.numbers.map((number) => {
        return { number: number.callerId };
      }),
      spamType,
    });

    this._checkOperatorNumbers({ ...data, applicationId: defaultApiStruct.applicationId }, operatorInfo);
    return defaultApiStruct;
  }

  public async checkNumber(data: CheckNumberDTO, spamType: SpamType): Promise<DefaultApplicationApiStruct> {
    const defaultApiStruct = this.biglandService.getDefaultApiStruct();
    await this.saveCheckNumberInfo({ defaultApiStruct, operator: data.operator, numbers: [{ number: data.callerId }], spamType });
    this._checkNumber({ ...data, applicationId: defaultApiStruct.applicationId });
    return defaultApiStruct;
  }

  public async setCheckNumberResult(data: CheckSpamCallResultDTO): Promise<void> {
    try {
      const result = await this.spamModelService.findByApplicationId(data.applicationId);
      if (result == null) return;

      await this.spamModelService.update(data.applicationId, this.formatUpdateData(data, result));
    } catch (e) {
      throw e;
    }
  }

  public async getSpamResultById(applicationId: string): Promise<SpamReportsResponseStruct[]> {
    try {
      const result = await this.spamModelService.findByApplicationId(applicationId);
      if (result == null) throw new HttpException({ message: `По данному ID ${applicationId} ничего не найдено` }, HttpStatus.NOT_FOUND);
      return new SpamDataAdapter([result]).get();
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getSpamReport(date: string): Promise<SpamReportsResponseStruct[]> {
    try {
      const result = await this.spamModelService.getActualSpamReportInfo(date);
      if (result.length == 0) throw new HttpException({ message: `По дате ${date} ничего не найдено` }, HttpStatus.NOT_FOUND);
      return new SpamDataAdapter(result).get();
    } catch (e) {
      throw e;
    }
  }

  public async stopCheck(applicationId: string): Promise<string> {
    try {
      const reuslt = await this.spamModelService.findByApplicationId(applicationId);
      if (reuslt == null) throw new HttpException({ message: `По данному ID ${applicationId} нет проверок` }, HttpStatus.NOT_FOUND);
      await this._stopCheck(applicationId, reuslt);
      return 'Успешная отмена';
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async isCancel(applicationId: string): Promise<boolean> {
    const actualStatus = await this.spamModelService.findByApplicationId(applicationId);
    return actualStatus.status === ApplicationApiActionStatus.cancel;
  }

  public async getSpamApplicationStatus(applicationId: string): Promise<Spam> {
    return await this.spamModelService.findByApplicationId(applicationId);
  }

  public async isInitCheck(spamType: SpamType): Promise<Spam[]> {
    return await this.spamModelService.getActualCheck(spamType);
  }

  private formatUpdateData(data: CheckSpamCallResultDTO, result: Spam): FormatSpamUpdateData {
    const callerId = UtilsService.normalizePhoneNumber(data.callerId);
    return {
      ...(!!!Number(data.amountOfNmber) ? { status: ApplicationApiActionStatus.completed } : {}),
      resultSpamCheck: result.resultSpamCheck.map((item) => {
        if (item.numbers.find((number) => number.number === callerId)) {
          return {
            ...item,
            numbers: item.numbers.map((number) => {
              if (number.number === callerId) {
                return {
                  ...number,
                  status: this.getStatus(data),
                };
              }
              return number;
            }),
          };
        }
        return item;
      }),
    };
  }

  private async _stopCheck(applicationId: string, reuslt: Spam): Promise<void> {
    await this.spamModelService.update(applicationId, { status: ApplicationApiActionStatus.cancel });
    if (reuslt.applicationIds.length !== 0) {
      await this.stopAllSpamCheck(reuslt.applicationIds);
    }
  }

  private async stopAllSpamCheck(applicationIds: string[]): Promise<void> {
    for (const id of applicationIds) {
      await this.spamModelService.update(id, { status: ApplicationApiActionStatus.cancel });
    }
  }

  private async _checkNumber(data: CheckNumberSpamData) {
    try {
      await this.ari.sendCall(data, AriCallType.checkSpamNumber);
      await this.spamModelService.update(data.applicationId, { status: ApplicationApiActionStatus.completed });
    } catch (e) {
      await this.spamModelService.update(data.applicationId, {
        status: ApplicationApiActionStatus.apiFail,
        error: e.message || e,
      });
    }
  }

  private async _checkOperatorNumbers(data: CheckOperatorSpamData, operatorInfo: Operators): Promise<void> {
    try {
      const numbers = [...operatorInfo.numbers];

      for (const number of numbers) {
        await UtilsService.sleep(SEND_CALL_CHECK_SPAM);

        if (await this.isCancel(data.applicationId)) break;

        this.delCheckNumber(operatorInfo, number);

        await this.ari.sendCall({ number, operatorInfo, data }, AriCallType.checkOperatorSpam);
      }
    } catch (e) {
      await this.spamModelService.update(data.applicationId, {
        status: ApplicationApiActionStatus.apiFail,
        error: e.message || e,
      });
    }
  }

  private delCheckNumber(operatorInfo: Operators, number: NumbersInfo): void {
    const index = operatorInfo.numbers.indexOf(number);
    if (index !== -1) {
      operatorInfo.numbers.splice(index, 1);
    }
  }

  private async saveCheckNumberInfo(data: SaveCheckNumberData): Promise<void> {
    await this.spamModelService.create({
      ...data.defaultApiStruct,
      spamType: data.spamType,
      checkDate: new Date(),
      resultSpamCheck: [
        {
          operator: data.operator,
          numbers: data.numbers,
        },
      ],
    });
  }

  private getStatus(data: CheckSpamCallResultDTO): CheckSpamStatus {
    if (!!data.dialStatus && data.dialStatus === AsteriskDialStatus.CHANUNAVAIL) {
      return CheckSpamStatus.failed;
    }
    return AMD_STATUS_TO_SPAM_MAP[data.amdStatus];
  }
}
