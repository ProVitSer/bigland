import { SystemService } from '@app/system/system.service';
import { Injectable } from '@nestjs/common';
import { BlackListNumbersDTO } from '../dto/black-list-numbers.dto';
import { ModifyBlackListNumbersResult } from '../interfaces/asterisk-api.interfaces';

@Injectable()
export class BlackListNumbersService {
    constructor(private readonly system: SystemService) {}

    public async getBlackListNumbers(): Promise<string[]> {
        try {

            const config = await this.system.getConfig();

            return config.blackListNumbers;

        } catch (e) {

            throw e;

        }
    }

    public async addNumbersToBlackList(data: BlackListNumbersDTO): Promise<ModifyBlackListNumbersResult> {
        try {

            const config = await this.system.getConfig();

            const addNumbers = data.numbers.filter((number: string) => !config.blackListNumbers.includes(number));

            if (addNumbers.length == 0) return {
                numbers: addNumbers
            };

            await this.system.updateBlackListNumbers([...config.blackListNumbers, ...addNumbers]);

            return {
                numbers: addNumbers
            };

        } catch (e) {

            throw e;

        }
    }

    public async deleteNumbersToBlackList(data: BlackListNumbersDTO): Promise<ModifyBlackListNumbersResult> {
        try {

            const config = await this.system.getConfig();

            const deleteNumbers = data.numbers.filter((n: string) => config.blackListNumbers.includes(n));

            if (deleteNumbers.length == 0) return {
                numbers: deleteNumbers
            };

            await this.system.updateBlackListNumbers([...config.blackListNumbers.filter((n: string) => !deleteNumbers.includes(n))]);

            return {
                numbers: deleteNumbers
            };

        } catch (e) {

            throw e;
            
        }
    }
}