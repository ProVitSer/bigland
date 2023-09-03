import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DeleteeOperatorNumbersResult,
  GetOperatorStruct,
  OperatorNumbersInfo,
  OperatorsInfo,
  OperatorsPhones,
  Phones,
  UpdateOperatorNumbersResult,
} from './interfaces/operators.interfaces';
import { NumbersInfo, Operators, OperatorsDocument } from './operators.schema';
import { OPERATOR_DEFAULT_SETTINGS, OPERATOR_PROJ } from './operators.constants';
import { OperatorsName } from './interfaces/operators.enum';
import { UtilsService } from '@app/utils/utils.service';

@Injectable()
export class OperatorsService {
  constructor(@InjectModel(Operators.name) private operatorsModel: Model<OperatorsDocument>) {}

  public async getOperators(): Promise<OperatorsInfo[]> {
    const operators = await this.operatorsModel.find({});
    return this.formatOperatorsInfo(operators);
  }

  // Убрать массив, возвращать { numbers: fromatOperatorsInfo }
  public async getOperatorsNumbers(): Promise<OperatorsPhones[]> {
    const operators = await this.getOperators();
    const fromatOperatorsInfo: Phones[] = [];
    operators.map((operator: OperatorsInfo) => {
      const { name, numbers } = operator;
      numbers.map((number: string) => {
        fromatOperatorsInfo.push({
          name,
          phone: number,
        });
      });
    });
    return [{ numbers: fromatOperatorsInfo }];
  }

  public async getOperator(operatorName: OperatorsName): Promise<Operators> {
    return await this.operatorsModel.findOne({ name: operatorName });
  }

  public async getOperatorById(operatorId: string): Promise<Operators> {
    return await this.operatorsModel.findOne({ operatorId });
  }

  public async resetNumbersCounts(operatorName: OperatorsName) {
    await this.operatorsModel.updateOne({ name: operatorName }, { $set: { 'numbers.$[].callCount': 0 } });
  }

  public async increaseCallerIdCount(callerId: string): Promise<void> {
    await this.operatorsModel.updateOne(
      {
        'numbers.callerId': UtilsService.normalizePhoneNumber(callerId),
      },
      {
        $inc: {
          'numbers.$.callCount': 1,
        },
      },
    );
  }

  public async getOperatorNumberInfo(operatorName: OperatorsName): Promise<GetOperatorStruct> {
    const result = await this.operatorsModel.findOne({ name: operatorName }, OPERATOR_PROJ);

    return {
      name: result.name,
      numbers: result.numbers.map((item) => String(item.callerId)),
    };
  }

  public async getOperatorByNumber(number: string): Promise<Operators[]> {
    return await this.operatorsModel.find({ 'numbers.callerId': number }).exec();
  }

  public async updateOperatorNumbers(operatorName: OperatorsName, newNumbers: string[]): Promise<UpdateOperatorNumbersResult> {
    const operatotNumbersInof = await this.operatorNumbersInfo(operatorName);
    const updateNumbers = newNumbers.filter((number: string) => !operatotNumbersInof.operatorNumbers.includes(number));
    if (updateNumbers.length == 0) return { numbers: updateNumbers };

    await this.updateNumbers(operatorName, updateNumbers);
    await this.resetNumbersCounts(operatorName);
    return { numbers: updateNumbers };
  }

  public async newDeleteOperatorNumber(operatorName: OperatorsName, newNumbers: string[]): Promise<DeleteeOperatorNumbersResult> {
    const operatotNumbersInof = await this.operatorNumbersInfo(operatorName);
    const deleteNumbers = newNumbers.filter((number: string) => operatotNumbersInof.operatorNumbers.includes(number));
    if (deleteNumbers.length == 0) return { numbers: deleteNumbers };

    await this.deleteNumbers(operatorName, newNumbers);
    return { numbers: deleteNumbers };
  }

  private async operatorNumbersInfo(operatorName: OperatorsName): Promise<OperatorNumbersInfo> {
    const operator = await this.operatorsModel.findOne({ name: operatorName });
    if (operator == null) throw new Error(`Оператор ${operatorName} не найден`);
    const actualNumbers = operator.numbers.map((n: NumbersInfo) => n.callerId);
    return {
      operator,
      operatorNumbers: actualNumbers,
    };
  }

  // На удаление
  public async deleteOperatorNumber(operatorName: OperatorsName, newNumbers: string[]): Promise<void> {
    const operator = await this.operatorsModel.findOne({ name: operatorName });
    if (operator == null) throw new Error(`Оператор ${operatorName} не найден`);
    return await this.deleteNumbers(operatorName, newNumbers);
  }

  private async deleteNumbers(operatorName: OperatorsName, deleteNumbers: string[]): Promise<void> {
    for (const number of deleteNumbers) {
      await this.operatorsModel.updateOne(
        { name: operatorName },
        {
          $pull: {
            numbers: {
              callerId: { $in: [number] },
            },
          },
        },
        { new: true },
      );
    }
  }

  private async updateNumbers(operatorName: OperatorsName, newNumbers: string[]): Promise<void> {
    for (const number of newNumbers) {
      await this.operatorsModel.updateOne(
        { name: operatorName },
        {
          $addToSet: {
            numbers: {
              $each: [
                {
                  ...OPERATOR_DEFAULT_SETTINGS[operatorName],
                  callerId: number,
                  createAt: new Date(),
                },
              ],
            },
          },
        },
        { new: true },
      );
    }
  }

  private formatOperatorsInfo(data: Operators[]): OperatorsInfo[] {
    const formatOperatorInfo: OperatorsInfo[] = [];
    data.map((operator: Operators) => {
      const numbers = [];
      operator.numbers.map((numberInfo: NumbersInfo) => {
        numbers.push(numberInfo.callerId);
      });
      formatOperatorInfo.push({ name: operator.name, numbers });
    });
    return formatOperatorInfo;
  }
}
