import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProxyCallingTtsUtils {
  constructor(private readonly configService: ConfigService) {}

  public getCallingTtsUrl(path: string) {
    return `${this.configService.get('ttsUrl')}${path.replace(`/${this.configService.get('apiPrefix')}`, '')}`;
  }
}
