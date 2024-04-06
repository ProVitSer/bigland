import { SystemService } from '@app/system/system.service';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { ChanspyDto } from '../dto/chanspy.dto';
import { ChanspyPasswordResult, UpdateChanspyPasswordResult } from '../interfaces/asterisk-api.interfaces';

@Injectable()
export class ChanspyApiService {
    constructor(private readonly system: SystemService) {}

    public async getPassword(): Promise<ChanspyPasswordResult> {
        try {

            const config = await this.system.getConfig();

            return {
                password: config.chanSpyPassword
            };

        } catch (e) {

            throw e;
            
        }
    }

    public async updatePassword(data: ChanspyDto): Promise<UpdateChanspyPasswordResult> {
        try {

            const currentConfig = await this.system.getConfig();

            await this.system.updateChanSpyPassword(currentConfig._id, data.password);

            return {
                updatePassword: data.password
            };

        } catch (e) {

            throw e;

        }
    }

    public async renewPassword(): Promise<ChanspyPasswordResult> {
        try {

            const newPassword = UtilsService.generateRandomNumber(4);

            const currentConfig = await this.system.getConfig();

            await this.system.updateChanSpyPassword(currentConfig._id, newPassword);

            return {
                password: newPassword
            };

        } catch (e) {

            throw e;
            
        }
    }
}