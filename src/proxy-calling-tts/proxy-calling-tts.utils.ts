import { ConfigEnvironmentVariables } from '@app/config/interfaces/config.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProxyCallingTtsUtils {
  constructor(private readonly configService: ConfigService<ConfigEnvironmentVariables>) {}

  public getCallingTtsUrl(path: string) {
    return `${this.configService.get('ttsUrl')}${path.replace(`/${this.configService.get('apiPrefix')}`, '')}`;
  }
}
