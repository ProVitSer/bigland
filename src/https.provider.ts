import { ConfigService } from '@nestjs/config';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { readFileSync } from 'fs';
import * as path from 'path';

export type ProtocolType = 'http' | 'https';

export default (config: ConfigService): HttpsOptions => {
  return (config.get('appProtocol') as ProtocolType) === 'https'
    ? {
        key: readFileSync(path.join(__dirname, config.get('security.key'))),
        cert: readFileSync(path.join(__dirname, config.get('security.cert'))),
      }
    : undefined;
};
