import { AppProtocol } from './config.enum';

export interface ConfigEnvironmentVariables {
  appProtocol: AppProtocol;
  appUrl: string;
  appPort: number;
  userAgent: string;
  security: SecurityEnvironmentVariables;
  auth: AuthEnvironmentVariables;
  log: LogEnvironmentVariables;
  telegram: TelegramEnvironmentVariables;
  rabbitMqUrl: string;
  database: {
    mongo: DatabaseEnvironmentVariables;
    mariadb: DatabaseEnvironmentVariables;
  };
  lds: {
    url: string;
    bearer: string;
    cookie: string;
  };
  docker: {
    host: string;
    port: string;
  };
  selenium: SeleniumEnvironmentVariables;
  gsmGateway: GsmGatewayEnvironmentVariables;
  mail: MailEnvironmentVariables;
  freepbx: FreepbxEnvironmentVariables;
  redis: RedisEnvironmentVariables;
  amocrm: AmocrmEnvironmentVariables;
  asterisk: AsteriskEnvironmentVariables;
  customConf: {
    recordDomain: string;
  };
}

interface SecurityEnvironmentVariables {
  key: string;
  cert: string;
  ipWhiteList: string[];
}

interface AuthEnvironmentVariables {
  jwtAccess: JwtEnvironmentVariables;
  jwtRefresh: JwtEnvironmentVariables;
}

interface JwtEnvironmentVariables {
  tokenSecretKey: string;
  algorithm: string;
  expiresIn: string;
}

interface LogEnvironmentVariables {
  path: string;
  formatDate: string;
  mixSize: string;
  maxFiles: string;
}

interface TelegramEnvironmentVariables {
  token: string;
  chartId: any;
}

interface DefaultConnectEnvironmentVariables {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface DatabaseEnvironmentVariables extends DefaultConnectEnvironmentVariables {
  database: string;
}

interface SeleniumEnvironmentVariables {
  host: string;
  selenoidDockerImg: string;
  capabilities: {
    browserName: string;
    version: string;
    name: string;
    platform: string;
    enableVNC: boolean;
  };
}

interface GsmGatewayEnvironmentVariables extends DefaultConnectEnvironmentVariables {
  gatewayPorts: string[];
  useRandomSendPort: boolean;
  sms: {
    notifyIncomingSms: boolean;
    notificationMethods: {
      email: string[];
      telegram: any;
    };
  };
}

interface MailEnvironmentVariables extends DefaultConnectEnvironmentVariables {
  secure: boolean;
  from: string;
}

interface FreepbxEnvironmentVariables {
  domain: string;
  username: string;
  password: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RedisEnvironmentVariables extends Omit<DefaultConnectEnvironmentVariables, 'username'> {}

export interface AmocrmEnvironmentVariables {
  domain: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  port: number;
  tokenPath: string;
  recordDomain: string;
  widget: {
    login: string;
    secret: string;
  };
  v2: {
    apiV2Domain: string;
    contentType: string;
    login: string;
    hash: string;
  };
}

export interface AsteriskEnvironmentVariables {
  ami: AmiAsteriskEnvironmentVariables;
  ari: AriAsteriskEnvironmentVariables;
}

export interface AmiAsteriskEnvironmentVariables extends DefaultConnectEnvironmentVariables {
  logLevel: number;
}

export interface AriAsteriskEnvironmentVariables {
  url: string;
  application: AriAppAsteriskEnvironmentVariables;
}

export interface AriAppAsteriskEnvironmentVariables {
  [key: string]: {
    stasis: string;
    user: string;
    password: string;
  };
}
