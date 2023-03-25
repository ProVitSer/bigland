import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OperatorsInfo } from './interfaces/operators.interfaces';
import { NumbersInfo, Operators, OperatorsDocument } from './operators.schema';

@Injectable()
export class OperatorsService {
  constructor(@InjectModel(Operators.name) private operatorsModel: Model<OperatorsDocument>) {}

  public async getOperators(): Promise<OperatorsInfo[]> {
    const operators = await this.operatorsModel.find({});
    return this.formatOperatorsInfo(operators);
  }

  public async getOperator(name: string): Promise<Operators> {
    return await this.operatorsModel.findOne({ name });
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
