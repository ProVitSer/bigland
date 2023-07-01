import { BiglandService } from '@app/bigland/bigland.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CheckNumberDTO, CheckOperatorNumbersDTO } from './dto/check-spam.dto';
import { CheckSpamCallResultDTO } from './dto/amd-spam-call-result.dto';
import { InjectModel } from '@nestjs/mongoose';
import { DataObject } from '@app/platform-types/common/interfaces';
import { Spam } from './spam.schema';
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
    console.log(applicationId);

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
    console.log(defaultApiStruct);
    this._checkOperatorNumbers(defaultApiStruct, { ...data, applicationId: defaultApiStruct.applicationId });
    return defaultApiStruct;
  }

  public async checkNumber(data: CheckNumberDTO): Promise<DefaultApplicationApiStruct> {
    const defaultApiStruct = this.biglandService.getDefaultApiStruct();
    await this.spamModelService.create({
      ...defaultApiStruct,
      checkDate: new Date(),
      spamCheckResult: [
        {
          operator: data.operator,
          numbers: [
            {
              number: data.callerId,
            },
          ],
        },
      ],
    });

    this._checkNumber({ ...data, applicationId: defaultApiStruct.applicationId });
    return defaultApiStruct;
  }

  public async setCheckNumberResult(data: CheckSpamCallResultDTO): Promise<void> {
    try {
      const result = await this.spamModelService.findByApplicationId(data.applicationId);
      if (result == null) return;

      const updatedData = {
        ...(!!!Number(data.amountOfNmber) ? { status: ApplicationApiActionStatus.completed } : {}),
        spamCheckResult: result.spamCheckResult.map((item) => {
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

  private getStatus(data: CheckSpamCallResultDTO): CheckSpamStatus {
    if (!!data.dialStatus && data.dialStatus === AsteriskDialStatus.CHANUNAVAIL) {
      return CheckSpamStatus.failed;
    }
    return AMD_STATUS_TO_SPAM_MAP[data.amdStatus];
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

  private async _checkOperatorNumbers(defaultApiStruct: DefaultApplicationApiStruct, data: CheckOperatorSpamData) {
    try {
      const operatorInfo = await this.operatorsService.getOperator(data.operator);
      const numbers = [...operatorInfo.numbers];
      await this.spamModelService.create({
        ...defaultApiStruct,
        checkDate: new Date(),
        spamCheckResult: [
          {
            operator: data.operator,
            numbers: operatorInfo.numbers.map((number) => {
              return { number: number.callerId };
            }),
          },
        ],
      });

      for (const number of numbers) {
        await UtilsService.sleep(SEND_CALL_CHECK_SPAM);

        const actualStatus = await this.spamModelService.findByApplicationId(data.applicationId);

        if (actualStatus.status === ApplicationApiActionStatus.cnacel) break;
        const index = operatorInfo.numbers.indexOf(number);
        if (index !== -1) {
          operatorInfo.numbers.splice(index, 1);
        }

        await this.ari.sendCall({ number, operatorInfo, data }, AriCallType.checkOperatorSpam);
      }
    } catch (e) {
      await this.spamModelService.update(data.applicationId, {
        status: ApplicationApiActionStatus.apiFail,
        error: e.message || e,
      });
    }
  }

  public async getSpamApplicationStatus(applicationId: string): Promise<Spam> {
    console.log(applicationId);
    return await this.spamModelService.findByApplicationId(applicationId);
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
}
