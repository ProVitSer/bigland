import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { writeFile, readFile, access } from 'fs/promises';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import {
  amocrmAPI,
  AmocrmTokenResponse,
  httpMethod,
} from './interfaces/amocrm.interfaces';
import { LogService } from '@app/log/log.service';

@Injectable()
export class AmocrmConnector implements OnApplicationBootstrap {
  public amocrmClient: any;

  constructor(
    @Inject('Amocrm') private readonly amocrm: any,
    private readonly configService: ConfigService,
    private readonly log: LogService,
  ) {}

  public async onApplicationBootstrap() {
    try {
      this.log.info('Init Amocrm', AmocrmConnector.name);
      this.amocrmClient = this.amocrm;
      const currentToken = await this.getConfigToken();
      await this.amocrmClient.connection.setToken(currentToken);
      await this.logConnection();
      const response = await this.amocrmClient.request(
        httpMethod.get,
        amocrmAPI.account,
      );
      if (!response.data.hasOwnProperty('id')) {
        this.log.error(
          `Init Amocrm error ${JSON.stringify(response)}`,
          AmocrmConnector.name,
        );
      }
      this.log.info('Init Amocrm successfully', AmocrmConnector.name);
    } catch (e) {
      this.log.error(e, AmocrmConnector.name);
    }
  }

  public async connect() {
    return this.amocrmClient;
  }

  private async getConfigToken() {
    try {
      const isFileExist = await this.isAccessible(
        path.join(__dirname, this.configService.get('amocrm.tokenPath')),
      );
      if (!isFileExist) {
        await this.amocrmAuth();
      }
      const token = await readFile(
        path.join(__dirname, this.configService.get('amocrm.tokenPath')),
      );
      return JSON.parse(token.toString());
    } catch (e) {
      this.log.error(e, AmocrmConnector.name);
    }
  }

  private async isAccessible(path: string): Promise<boolean> {
    return access(path)
      .then(() => true)
      .catch(() => false);
  }

  public async amocrmAuth(): Promise<void> {
    try {
      const authUrl = await this.amocrmClient.connection.getAuthUrl();
      console.log(
        'Вам нужно перейти по ссылке и выдать права на аккаунт, а после перезагрузить приложение',
        authUrl,
      );
      await this.amocrmClient.request('GET', '/api/v4/account');
      const tokenInit: AmocrmTokenResponse =
        await this.amocrmClient.connection.getToken();
      await writeFile(
        path.join(__dirname, this.configService.get('amocrm.tokenPath')),
        JSON.stringify(tokenInit),
      );
      return;
    } catch (e) {
      this.log.error(e, AmocrmConnector.name);
    }
  }

  private async refreshToken(): Promise<void> {
    const token: AmocrmTokenResponse = (
      await this.amocrmClient.connection.refreshToken()
    ).data;
    return await writeFile(
      path.join(__dirname, this.configService.get('amocrm.tokenPath')),
      JSON.stringify(token),
    );
  }

  private async logConnection(): Promise<void> {
    this.amocrmClient.on('connection:beforeConnect', async (error: any) => {
      this.log.info(`connection:beforeConnect ${error}`, AmocrmConnector.name);
      await this.refreshToken();
    });

    this.amocrmClient.on('connection:newToken', async (response: any) => {
      this.log.info(
        `connection:newToken ${JSON.stringify(response)}`,
        AmocrmConnector.name,
      );
      await writeFile(
        path.join(__dirname, this.configService.get('amocrm.tokenPath')),
        JSON.stringify(response.data),
      );
    });

    this.amocrmClient.on('connection:authError', async (error: any) => {
      this.log.error(`connection:authError ${error}`, AmocrmConnector.name);
      await this.refreshToken();
    });

    this.amocrmClient.on('connection:error', (error: any) => {
      this.log.error(`connection:error ${error}`);
    });

    this.amocrmClient.on('connection:beforeRefreshToken', (response: any) => {
      this.log.info(
        `connection:beforeRefreshToken ${JSON.stringify(response)}`,
        AmocrmConnector.name,
      );
    });

    return;
  }
}
