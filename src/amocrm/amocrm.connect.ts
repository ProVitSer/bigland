import { HttpStatus, Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { writeFile, readFile, access } from 'fs/promises';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { LogService } from '@app/log/log.service';
import { AmocrmAPI, AmoCRMAPIV2 } from './interfaces/amocrm.enum';
import { Client } from 'amocrm-js';
import { ITokenData } from 'amocrm-js/dist/interfaces/common';
import { INIT_AMO, INIT_AMO_ERROR, INIT_AMO_SUCCESS } from './amocrm.constants';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AmocrmConnector implements OnApplicationBootstrap {
  public amocrmClient: Client = this.amocrm;

  constructor(
    @Inject('Amocrm') private readonly amocrm: Client,
    private readonly configService: ConfigService,
    private readonly log: LogService,
  ) {}

  public async onApplicationBootstrap() {
    try {
      this.log.info(INIT_AMO, AmocrmConnector.name);
      await this.setToken();
      await this.logConnection();
      // Убираем, так как не получаем ответ пока не стартанет сервис, переносим в health
      //await this.checkAmocrmInteraction();
    } catch (e) {
      this.log.error(e, AmocrmConnector.name);
    }
  }

  public async getAmocrmClient() {
    return this.amocrmClient;
  }

  private async checkAmocrmInteraction() {
    try {
      const response = await this.amocrmClient.request.get(AmocrmAPI.account);
      if (!response.data.hasOwnProperty('id')) {
        this.log.error(`${INIT_AMO_ERROR} ${JSON.stringify(response)}`, AmocrmConnector.name);
      }
      this.log.info(INIT_AMO_SUCCESS, AmocrmConnector.name);
    } catch (e) {
      throw e;
    }
  }

  private async setToken() {
    const currentToken = await this.getConfigToken();
    this.amocrmClient.token.setValue(currentToken);
  }

  private async getConfigToken() {
    try {
      const isFileExist = await this.isAccessible(path.join(__dirname, this.configService.get('amocrm.tokenPath')));
      if (!isFileExist) {
        await this.amocrmAuth();
      }
      const token = await readFile(path.join(__dirname, this.configService.get('amocrm.tokenPath')));
      return JSON.parse(token.toString());
    } catch (e) {
      throw e;
    }
  }

  private async isAccessible(path: string): Promise<boolean> {
    return access(path)
      .then(() => true)
      .catch(() => false);
  }

  private async amocrmAuth(): Promise<void> {
    try {
      const authUrl = this.amocrmClient.auth.getUrl('popup');
      console.log('Вам нужно перейти по ссылке и выдать права на аккаунт, а после перезагрузить приложение', authUrl);
      await this.amocrmClient.request.get(AmocrmAPI.account);
      const tokenInit: ITokenData = this.amocrmClient.token.getValue();
      await writeFile(path.join(__dirname, this.configService.get('amocrm.tokenPath')), JSON.stringify(tokenInit));
      return;
    } catch (e) {
      throw e;
    }
  }

  private async refreshToken(): Promise<void> {
    const token: ITokenData = await this.amocrmClient.token.refresh();
    return await writeFile(path.join(__dirname, this.configService.get('amocrm.tokenPath')), JSON.stringify(token));
  }

  private async logConnection(): Promise<void> {
    this.amocrmClient.on('connection:beforeConnect', async (error: any) => {
      this.log.info(`connection:beforeConnect ${error}`, AmocrmConnector.name);
      await this.refreshToken();
    });

    this.amocrmClient.on('connection:newToken', async (response: any) => {
      this.log.info(`connection:newToken ${JSON.stringify(response)}`, AmocrmConnector.name);
      await writeFile(path.join(__dirname, this.configService.get('amocrm.tokenPath')), JSON.stringify(response.data));
    });

    this.amocrmClient.on('connection:authError', async (error: any) => {
      this.log.error(`connection:authError ${error}`, AmocrmConnector.name);
      await this.refreshToken();
    });

    this.amocrmClient.on('connection:error', (error: any) => {
      this.log.error(`connection:error ${error}`);
    });

    this.amocrmClient.on('connection:beforeRefreshToken', (response: any) => {
      this.log.info(`connection:beforeRefreshToken ${JSON.stringify(response)}`, AmocrmConnector.name);
    });

    return;
  }
}

@Injectable()
export class AmocrmV2Auth {
  public readonly amocrmApiV2Domain = this.configService.get('amocrm.v2.apiV2Domain');
  public authCookies: string[];
  constructor(private readonly configService: ConfigService, private httpService: HttpService) {}

  public async auth() {
    try {
      const isAuth = await this.checkAuth();
      if (isAuth) {
        return;
      } else {
        return await this.authAmocrm();
      }
    } catch (e) {
      throw e;
    }
  }

  private async checkAuth(): Promise<boolean> {
    try {
      const result = await this.httpService.get(`${this.amocrmApiV2Domain}${AmoCRMAPIV2.account}`).toPromise();
      return !!result.data.name;
    } catch (e) {
      throw e;
    }
  }

  private async authAmocrm(): Promise<void> {
    try {
      const body = {
        USER_LOGIN: this.configService.get('amocrm.v2.login'),
        USER_HASH: this.configService.get('amocrm.v2.hash'),
      };
      const result = await this.httpService.post(`${this.amocrmApiV2Domain}${AmoCRMAPIV2.auth}`, body).toPromise();
      if (!!result.status && !!result.headers['set-cookie'] && result.status == HttpStatus.OK) {
        this.authCookies = result.headers['set-cookie'];
      } else {
        throw String(result);
      }
      return;
    } catch (e) {
      throw e;
    }
  }
}
