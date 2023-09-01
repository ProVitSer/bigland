import { ConfigEnvironmentVariables } from '@app/config/interfaces/config.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServerStaticService {
  constructor(private readonly configService: ConfigService<ConfigEnvironmentVariables>) {}

  public getStaticUrl(): string {
    return `${this.configService.get('appProtocol')}://${this.configService.get('appUrl')}:${this.configService.get(
      'appPort',
    )}${this.configService.get('serveStatic')}`;
  }
}
