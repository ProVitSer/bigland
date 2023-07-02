import { BiglandService } from '@app/bigland/bigland.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CheckNumberDTO, CheckOperatorNumbersDTO } from './dto/check-spam.dto';
import { CheckSpamCallResultDTO } from './dto/amd-spam-call-result.dto';
import { InjectModel } from '@nestjs/mongoose';
import { DataObject } from '@app/platform-types/common/interfaces';
import { Spam, SpamCheckNumbersInfo } from './spam.schema';
import { Model } from 'mongoose';
import { AriACallService } from '@app/asterisk/ari/ari-call.service';
import { OperatorsService } from '@app/operators/operators.service';
import { CheckNumberSpamData, CheckOperatorSpamData } from './interfaces/spam-api.interfaces';
import { ApplicationApiActionStatus } from '@app/bigland/interfaces/bigland.enum';
import { UtilsService } from '@app/utils/utils.service';
import { SEND_CALL_CHECK_SPAM } from '@app/asterisk-api/asterisk-api.constants';
import { AriCallType } from '@app/asterisk/ari/interfaces/ari.enum';
import { DefaultApplicationApiStruct } from '@app/bigland/interfaces/bigland.interfaces';
import { AsteriskDialStatus } from '@app/asterisk/interfaces/asterisk.enum';
import { AMD_STATUS_TO_SPAM_MAP } from './spam-api.constants';
import { CheckSpamStatus } from './interfaces/spam-api.enum';
import { OperatorsName } from '@app/operators/interfaces/operators.enum';
import { NumbersInfo, Operators } from '@app/operators/operators.schema';

@Injectable()
export class SpamModelService {
  constructor(@InjectModel(Spam.name) private spamModel: Model<Spam>) {}

  public async create(data: Spam): Promise<Spam> {
    const spam = new this.spamModel({
      ...data,
    });
    return await spam.save();
  }

  public async update(applicationId: string, data: DataObject) {
    return await this.spamModel.updateOne({ applicationId: applicationId }, { $set: { ...data } });
  }

  public async findByApplicationId(applicationId: string) {
    return await this.spamModel.findOne({ applicationId }, { _id: 0 });
  }
}

@Injectable()
export class SpamApiService {
  constructor(
    private readonly biglandService: BiglandService,
    private readonly ari: AriACallService,
    private readonly operatorsService: OperatorsService,
    private readonly spamModelService: SpamModelService,
    @InjectModel(Spam.name) private spamModel: Model<Spam>,
  ) {}

  public async checkOperatorNumbers(data: CheckOperatorNumbersDTO): Promise<DefaultApplicationApiStruct> {
    const defaultApiStruct = this.biglandService.getDefaultApiStruct();
    const operatorInfo = await this.operatorsService.getOperator(data.operator);
    await this.saveCheckNumberInfo(
      defaultApiStruct,
      data.operator,
      operatorInfo.numbers.map((number) => {
        return { number: number.callerId };
      }),
    );

    this._checkOperatorNumbers(defaultApiStruct, { ...data, applicationId: defaultApiStruct.applicationId }, operatorInfo);
    return defaultApiStruct;
  }

  public async checkNumber(data: CheckNumberDTO): Promise<DefaultApplicationApiStruct> {
    const defaultApiStruct = this.biglandService.getDefaultApiStruct();
    await this.saveCheckNumberInfo(defaultApiStruct, data.operator, [{ number: data.callerId }]);
    this._checkNumber({ ...data, applicationId: defaultApiStruct.applicationId });
    return defaultApiStruct;
  }

  public async setCheckNumberResult(data: CheckSpamCallResultDTO): Promise<void> {
    try {
      const result = await this.spamModelService.findByApplicationId(data.applicationId);
      if (result == null) return;

      const updatedData = {
        ...(!!!Number(data.amountOfNmber) ? { status: ApplicationApiActionStatus.completed } : {}),
        resultSpamCheck: result.resultSpamCheck.map((item) => {
          if (item.numbers.find((number) => number.number === data.callerId)) {
            return {
              ...item,
              numbers: item.numbers.map((number) => {
                if (number.number === data.callerId) {
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

      await this.spamModelService.update(data.applicationId, updatedData);
    } catch (e) {
      throw e;
    }
  }

  public async getResult(applicationId: string): Promise<Spam> {
    try {
      const result = await this.spamModelService.findByApplicationId(applicationId);
      if (result == null) throw new HttpException({ message: `По данному ID ${applicationId} ничего не найдено` }, HttpStatus.NOT_FOUND);
      return result;
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async stopCheck(applicationId: string): Promise<string> {
    try {
      const reuslt = await this.spamModelService.findByApplicationId(applicationId);
      if (reuslt == null) throw new HttpException({ message: `По данному ID ${applicationId} нет проверок` }, HttpStatus.NOT_FOUND);
      await this.spamModelService.update(applicationId, { status: ApplicationApiActionStatus.cnacel });
      return 'Успешная отмена';
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
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

  private async _checkOperatorNumbers(defaultApiStruct: DefaultApplicationApiStruct, data: CheckOperatorSpamData, operatorInfo: Operators) {
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

  private async isCancel(applicationId: string): Promise<boolean> {
    const actualStatus = await this.spamModelService.findByApplicationId(applicationId);
    return actualStatus.status === ApplicationApiActionStatus.cnacel;
  }

  private async saveCheckNumberInfo(
    defaultApiStruct: DefaultApplicationApiStruct,
    operator: OperatorsName,
    numbers: SpamCheckNumbersInfo[],
  ) {
    await this.spamModelService.create({
      ...defaultApiStruct,
      checkDate: new Date(),
      resultSpamCheck: [
        {
          operator,
          numbers,
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

  public async getSpamApplicationStatus(applicationId: string): Promise<Spam> {
    return await this.spamModelService.findByApplicationId(applicationId);
  }
}
