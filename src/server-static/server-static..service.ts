import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServerStaticService {
  constructor(private readonly configService: ConfigService) {}

  public getStaticUrl() {
    return `${this.configService.get('appProtocol')}://${this.configService.get('appUrl')}:${this.configService.get(
      'appPort',
    )}${this.configService.get('serveStatic')}`;
  }
}
