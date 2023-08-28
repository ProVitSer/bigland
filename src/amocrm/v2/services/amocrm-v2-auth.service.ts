import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AmocrmAPIV2 } from '../../interfaces/amocrm.enum';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { AmocrmAPIV2AuthBody } from '@app/amocrm/interfaces/amocrm.interfaces';

@Injectable()
export class AmocrmV2AuthService {
  public readonly amocrmApiV2Domain = this.configService.get('amocrm.v2.apiV2Domain');
  private authCookies: string[];
  private authBody: AmocrmAPIV2AuthBody = {
    USER_LOGIN: this.configService.get('amocrm.v2.login'),
    USER_HASH: this.configService.get('amocrm.v2.hash'),
  };
  constructor(private readonly configService: ConfigService, private httpService: HttpService) {}

  public async getAuthCookies() {
    await this.auth();
    return this.authCookies;
  }

  private async auth(): Promise<void> {
    try {
      const isAuth = await this.checkAuth();
      if (isAuth) {
        return;
      } else {
        await this.authAmocrm();
      }
    } catch (e) {
      throw e;
    }
  }

  private async checkAuth(): Promise<boolean> {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`${this.amocrmApiV2Domain}${AmocrmAPIV2.account}`).pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
      );
      return !!result.data.name;
    } catch (e) {
      throw e;
    }
  }

  private async authAmocrm(): Promise<void> {
    try {
      const result = await firstValueFrom(
        this.httpService.post(`${this.amocrmApiV2Domain}${AmocrmAPIV2.auth}`, this.authBody).pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
      );

      if (!!result.status && !!result.headers['set-cookie'] && result.status == HttpStatus.OK) {
        this.authCookies = result.headers['set-cookie'];
      } else {
        throw result;
      }
    } catch (e) {
      throw e;
    }
  }
}