import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetOperatorStruct, OperatorsInfo, OperatorsPhones, Phones } from './interfaces/operators.interfaces';
import { NumbersInfo, Operators, OperatorsDocument } from './operators.schema';
import { OPERATOR_DEFAULT_SETTINGS, OPERATOR_PROJ } from './operators.constants';
import { OperatorsName } from './interfaces/operators.enum';

@Injectable()
export class OperatorsService {
  constructor(@InjectModel(Operators.name) private operatorsModel: Model<OperatorsDocument>) {}

  public async getOperators(): Promise<OperatorsInfo[]> {
    const operators = await this.operatorsModel.find({});
    return this.formatOperatorsInfo(operators);
  }

  public async getOperatorsPhones(): Promise<OperatorsPhones[]> {
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

  public async getOperator(operatorName: string): Promise<Operators> {
    return await this.operatorsModel.findOne({ name: operatorName });
  }

  public async getOperatorNumberInfo(operatorName: string): Promise<GetOperatorStruct> {
    const result = await this.operatorsModel.findOne({ name: operatorName }, OPERATOR_PROJ);

    return {
      name: result.name,
      numbers: result.numbers.map((item) => String(item.callerId)),
    };
  }

  public async getOperatorByNumber(number: string): Promise<Operators[]> {
    return await this.operatorsModel.find({ 'numbers.callerId': number }).exec();
  }

  public async updateOperatorNumber(operatorName: OperatorsName, newNumbers: string[]): Promise<void> {
    const operator = await this.operatorsModel.findOne({ name: operatorName });
    if (operator == null) throw new Error(`Оператор ${operatorName} не найден`);
    return await this.updateNumbers(operatorName, newNumbers);
  }

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
