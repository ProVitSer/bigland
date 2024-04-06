import { Operators } from '@app/operators/operators.schema';
import { CheckBatchDTO } from '../dto/check-batch.dto';

export class CheckBatchOperatorAdapter {
    public operatorInfo: Operators;
    private pbxTrunkNumber: number;
    private outSuffix: string;
    
    constructor(data: CheckBatchDTO, operator: Operators) {

        this.outSuffix = operator.numbers[0].outSuffix;

        this.pbxTrunkNumber = operator.numbers[0].pbxTrunkNumber;

        this.operatorInfo = {
            name: operator.name,
            formatNumber: operator.formatNumber,
            operatorId: operator.operatorId,
            numbers: data.numbers.map((number: string) => {

                return {
                    pbxTrunkNumber: this.pbxTrunkNumber,
                    callerId: number,
                    outSuffix: this.outSuffix,
                };

            }),
        };
    }
}