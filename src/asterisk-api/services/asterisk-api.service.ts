import { DataObject } from '@app/platform-types/common/interfaces';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AsterikkApi } from '../asterisk-api.schema';
import { CheckNumberDTO, CheckOperatorNumbersDTO } from '../dto/check-spam.dto';
import { AsteriskApiActionStatus, AsteriskApiNumberStatus, AsteriskDialStatus } from '../interfaces/asterisk-api.enum';
import { CallApiService } from '.';
import { AmdCallResultDTO } from '../dto/amd-call-result.dto';
import { AMD_STATUS_TO_SPAM_MAP } from '../asterisk-api.constants';
import { DefaultAsterisApiResponceStruct } from '../interfaces/asterisk-api.interfaces';

@Injectable()
export class AsteriskApiModelService {
  constructor(@InjectModel(AsterikkApi.name) private asteriskApiModel: Model<AsterikkApi>) {}

  public async create(data: DataObject): Promise<AsterikkApi> {
    return this.asteriskApiModel.create(data);
  }

  public async update(id: string, data: DataObject) {
    return await this.asteriskApiModel.updateOne({ _id: id }, { $set: { ...data } });
  }

  public async findById(id: string) {
    return await this.asteriskApiModel.findById(id);
  }
}

@Injectable()
export class AsteriskApiService {
  constructor(private readonly astApiModelService: AsteriskApiModelService, private readonly callApiService: CallApiService) {}

  public async checkOperatorNumbers(data: CheckOperatorNumbersDTO): Promise<DefaultAsterisApiResponceStruct> {
    const response = await this.getDefaultStruct({ requestData: data });
    this.callApiService.checkOperatorNumberForSpam({ ...data, asteriskApiId: response.asteriskApiId });
    return response;
  }

  public async checkNumber(data: CheckNumberDTO): Promise<DefaultAsterisApiResponceStruct> {
    const response = await this.getDefaultStruct({ requestData: data });
    this.callApiService.checkNumberForSpam({ ...data, asteriskApiId: response.asteriskApiId });
    return response;
  }

  public async setCheckNumberResult(data: AmdCallResultDTO): Promise<void> {
    const result = await this.astApiModelService.findById(data.asteriskApiId);
    const updateResultData = [
      ...(result?.resultData?.numbersInfo || []),
      {
        number: data.callerId,
        spamStatus: this.getStatus(data),
      },
    ];

    const status =
      updateResultData.length === Number(data.amountOfNmber) ? AsteriskApiActionStatus.completed : AsteriskApiActionStatus.inProgress;

    await this.astApiModelService.update(data.asteriskApiId, { resultData: { numbersInfo: updateResultData }, status });
  }

  private getStatus(data: AmdCallResultDTO): AsteriskApiNumberStatus {
    if (!!data.dialStatus && data.dialStatus === AsteriskDialStatus.CHANUNAVAIL) {
      return AsteriskApiNumberStatus.failed;
    }
    return AMD_STATUS_TO_SPAM_MAP[data.amdStatus];
  }

  public async getAsteriskApiStatus(id: string) {
    const result = await this.astApiModelService.findById(id);
    return {
      status: result.status,
      ...result.resultData,
    };
  }

  private async getDefaultStruct(data: DataObject, fields?: DataObject): Promise<DefaultAsterisApiResponceStruct> {
    const { _id } = await this.astApiModelService.create({ ...data, ...fields });
    return {
      asteriskApiId: _id,
      status: AsteriskApiActionStatus.inProgress,
    };
  }
}
