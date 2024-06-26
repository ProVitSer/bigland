export enum AppProtocol {
    http = 'http',
    https = 'https',
}

export enum GsmGatewayProvider {
    gsm = 'GSM',
}

export enum AsteriskAriProvider {
    chanspy = 'CHANSPY',
    amocrm = 'AMOCRM',
    blacklist = 'BLACKLIST',
    aricall = 'ARICALL',
}

export enum AsteriskAmiProvider {
    ami = 'AMI',
}

export enum LogLevel {
    console = 'console',
    error = 'error',
    warn = 'warn',
    info = 'info',
    http = 'http',
    verbose = 'verbose',
    debug = 'debug',
    silly = 'silly',
}

export enum DatabaseType {
    mongo = 'mongo',
    mariadb = 'mariadb',
}

export enum JwtTokenConfType {
    access = 'auth.jwtAccess',
    refresh = 'auth.jwtRefresh',
}
