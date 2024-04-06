import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { AriAsteriskEnvironmentVariables } from '@app/config/interfaces/config.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AsteriskUtilsService {
    static getStasis(ariConf: AriAsteriskEnvironmentVariables[], provider: AsteriskAriProvider): AriAsteriskEnvironmentVariables {

        return ariConf.filter((conf: AriAsteriskEnvironmentVariables) => {
            return conf.providerName === provider;
        })[0];
        
    }
}