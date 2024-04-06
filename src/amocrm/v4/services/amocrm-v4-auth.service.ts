import { Inject, Injectable } from '@nestjs/common';
import { writeFile, readFile } from 'fs/promises';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { LogService } from '@app/log/log.service';
import { Client } from 'amocrm-js';
import { ITokenData } from 'amocrm-js/dist/interfaces/common';
import { INIT_AMO, INIT_AMO_ERROR, INIT_AMO_SUCCESS } from '../../amocrm.constants';
import { AmocrmAPIV4 } from '../../interfaces/amocrm.enum';
import { UtilsService } from '@app/utils/utils.service';
import { AmocrmEnvironmentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class AmocrmV4AuthService {
    public amocrmClient: Client;
    private amocrmConfig = this.configService.get<AmocrmEnvironmentVariables>('amocrm');

    constructor(
        @Inject('AMOCRM') private readonly amocrm: Client,
        private readonly configService: ConfigService,
        private readonly log: LogService,
    ) {}

    public async initAmocrmClient(): Promise<Client> {

        this.log.info(INIT_AMO, AmocrmV4AuthService.name);

        await this.setToken();

        this.handleConnection();

        this.checkAmocrmInteraction();

        return this.amocrm;

    }

    public getAmocrmClient(): Client {

        return this.amocrm;

    }

    public async getToken(): Promise<ITokenData>  {

        const token = await readFile(path.join(__dirname, '..', this.amocrmConfig.tokenPath));

        return JSON.parse(token.toString());

    }

    private async checkAmocrmInteraction(): Promise<void> {
        try {

            const response = await this.amocrm.request.get(AmocrmAPIV4.account);

            if (!response.data.hasOwnProperty('id')) {
                this.log.error(`${INIT_AMO_ERROR} ${JSON.stringify(response)}`, AmocrmV4AuthService.name);
            };

            this.log.info(INIT_AMO_SUCCESS, AmocrmV4AuthService.name);

        } catch (e) {

            throw e;

        }
    }

    private async setToken(): Promise<void> {

        const currentToken = await this.getConfigToken();

        this.amocrm.token.setValue(currentToken);

    }

    private async getConfigToken(): Promise<ITokenData> {
        try {

            const isFileExist = await UtilsService.isAccessible(path.join(__dirname, '..', this.amocrmConfig.tokenPath));

            if (!isFileExist) {
                await this.amocrmAuth();
            }

            return await this.getToken();

        } catch (e) {

            throw e;

        }
    }

    private async amocrmAuth(): Promise<void> {
        try {

            const authUrl = this.amocrmClient.auth.getUrl('popup');

            console.log('Вам нужно перейти по ссылке и выдать права на аккаунт, а после перезагрузить приложение', authUrl);

            await this.amocrm.request.get(AmocrmAPIV4.account);

            const tokenInit: ITokenData = this.amocrm.token.getValue();

            await writeFile(path.join(__dirname, this.amocrmConfig.tokenPath), JSON.stringify(tokenInit));

            return;

        } catch (e) {

            throw e;

        }
    }

    private async refreshToken(): Promise<void> {

        const token: ITokenData = await this.amocrm.token.refresh();

        return await writeFile(path.join(__dirname, this.amocrmConfig.tokenPath), JSON.stringify(token));

    }

    private handleConnection(): Promise<void> {

        this.amocrm.token.on('change', async () => {
            this.log.info('token:change :', AmocrmV4AuthService.name);
        });

        this.amocrm.connection.on('connectionError', async (error: any) => {
            this.log.error(`connection:connectionError ${error}`, AmocrmV4AuthService.name);
            await this.refreshToken();
        });

        this.amocrm.token.on('beforeRefresh', () => {
            this.log.info('token:beforeRefreshToken', AmocrmV4AuthService.name);
        });

        this.amocrm.token.on('refresh', () => {
            this.log.info('token:refresh', AmocrmV4AuthService.name);
        });

        return;
    }
}