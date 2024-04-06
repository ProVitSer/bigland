import { ResultSpamCheck, SpamCheckInfo, SpamCheckReportsResult, SpamReportsResponseStruct } from '../interfaces/spam-api.interfaces';
import { Spam } from '../spam.schema';

export class SpamDataAdapter {
    private responseData: SpamReportsResponseStruct[];

    constructor(data: Spam[]) {

        this.responseData = this.formatSpamReportsResponse(data);

    }

    public get(): SpamReportsResponseStruct[] {

        return this.responseData;

    }

    private formatSpamReportsResponse(result: Spam[]): SpamReportsResponseStruct[] {

        const spamCheckResult: SpamCheckReportsResult[] = [];

        const response: SpamReportsResponseStruct[] = [];

        result.map((r: Spam) => {
            r.resultSpamCheck.map((result: ResultSpamCheck) => {

                result.numbers.map((n: SpamCheckInfo) => {

                    if (!!n?.status) {

                        spamCheckResult.push({
                            operator: result.operator,
                            status: n.status,
                            number: n.number,
                        });

                    }

                });

            });

            response.push({
                
                applicationId: r.applicationId,
                status: r.status,
                resultSpamCheck: spamCheckResult,
                checkDate: r.checkDate,
            });

        });
        
        return response;
    }
}