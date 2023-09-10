import { ConfigService } from '@nestjs/config';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { readFileSync } from 'fs';
import * as path from 'path';
import { AppProtocol } from './config/interfaces/config.enum';

export default (config: ConfigService): HttpsOptions => {
  return (config.get('appProtocol') as AppProtocol) === AppProtocol.https
    ? {
        key: readFileSync(path.join(__dirname, config.get('security.key'))),
        cert: readFileSync(path.join(__dirname, config.get('security.cert'))),
        ca: readFileSync(path.join(__dirname, config.get('security.ca'))),
      }
    : undefined;
};
