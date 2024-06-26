import { AppProtocol, AsteriskAmiProvider, AsteriskAriProvider, GsmGatewayProvider } from './config.enum';

export interface ConfigEnvironmentVariables {
    appProtocol: AppProtocol;
    appUrl: string;
    appPort: number;
    apiPrefix: string;
    userAgent: string;
    ttsUrl: string;
    security: SecurityEnvironmentVariables;
    cors: CorsEnvironmentVariables;
    serveStatic: string;
    auth: AuthEnvironmentVariables;
    log: LogEnvironmentVariables;
    telegram: TelegramEnvironmentVariables;
    rabbitMqUrl: string;
    database: {
        mongo: DatabaseEnvironmentVariables;
        mariadb: DatabaseEnvironmentVariables;
    };
    lds: LDSEnviromentVariables;
    docker: DockerEnvironmentVariables[];
    selenium: SeleniumEnvironmentVariables;
    mail: MailEnvironmentVariables;
    freepbx: FreepbxEnvironmentVariables;
    redis: RedisEnvironmentVariables;
    amocrm: AmocrmEnvironmentVariables;
    asterisk: AsteriskEnvironmentVariables;
    cdrMicroservice: string;
    heath: HealthMailEnvironmentVariables;
    files: FilesEnvironmentVariables;
    reports: ReportsEnviromentVariables;
}

export interface LDSEnviromentVariables {
    url: string;
    bearer: string;
    cookie: string;
}

export interface ReportsEnviromentVariables {
    spam: {
        from: string;
        to: string[];
        subject: string;
        verificationNumber: string;
    };
}

export interface CorsEnvironmentVariables {
    allowedHeaders: string;
    origin: string[];
    methods: string;
    credentials: boolean;
    maxAge: number;
}

export interface FilesEnvironmentVariables {
    path: {
        files: string;
        tmp: string;
    };
}

export interface SecurityEnvironmentVariables {
    key: string;
    cert: string;
    ca: string;
    ipWhiteList: string[];
}

export interface AuthEnvironmentVariables {
    jwtAccess: JwtEnvironmentVariables;
    jwtRefresh: JwtEnvironmentVariables;
}

export interface JwtEnvironmentVariables {
    tokenSecretKey: string;
    tokenExpireMin ? : string;
    algorithm: Algorithm;
    expiresIn: string;
}

export interface LogEnvironmentVariables {
    path: string;
    formatDate: string;
    mixSize: string;
    maxFiles: string;
}

export interface TelegramEnvironmentVariables {
    token: string;
    chartId: any;
}

export interface DefaultConnectEnvironmentVariables {
    host: string;
    port: number;
    username: string;
    password: string;
}

export interface DatabaseEnvironmentVariables extends DefaultConnectEnvironmentVariables {
    database: string;
}

export interface SeleniumEnvironmentVariables {
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

export interface GsmGatewayEnvironmentVariables extends DefaultConnectEnvironmentVariables {
    providerName: GsmGatewayProvider;
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

export interface MailEnvironmentVariables extends Omit < DefaultConnectEnvironmentVariables, 'username' | 'password' > {
    secure: boolean;
    from: string;
    auth: {
        user: string;
        pass: string;
    };
}

export interface FreepbxEnvironmentVariables {
    domain: string;
    username: string;
    password: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RedisEnvironmentVariables extends Omit < DefaultConnectEnvironmentVariables, 'username' > {}

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
    recordPath: string;
    ami: AmiAsteriskEnvironmentVariables[];
    ari: AriAsteriskEnvironmentVariables[];
}

export interface AmiAsteriskEnvironmentVariables extends DefaultConnectEnvironmentVariables {
    providerName: AsteriskAmiProvider;
    logLevel: number;
}

export interface AriAsteriskEnvironmentVariables {
    providerName: AsteriskAriProvider;
    url: string;
    stasis: string;
    user: string;
    password: string;
}

export interface DockerEnvironmentVariables {
    providerName: string;
    host: string;
    port: string;
}

export interface HealthMailEnvironmentVariables {
    mail: {
        mailListNotifyer: string[];
        from: string;
    };
}