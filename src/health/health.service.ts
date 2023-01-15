import { ConfigEnvironmentVariables } from '@app/config/interfaces/config.interface';
import { Get, HttpStatus, Injectable } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
  MongooseHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';
import { HealthCheckStatusType, ReturnHealthFormatType } from './interfaces/health.enum';
import { HealthCheckMailFormat } from './interfaces/health.interface';
import configuration from '../config/config.provider';
import {
  DockerServiceHealthIndicator,
  DockerImgServiceHealthIndicator,
  AsteriskHealthIndicator,
  AsteriskAriApplicationHealthIndicator,
  RedisHealthIndicator,
  GsmGatewayHealthIndicator,
  AmocrmHealthIndicator,
} from './health-indicators';

@Injectable()
export class HealthService {
  private config: ConfigEnvironmentVariables;
  constructor(
    private healthCheckService: HealthCheckService,
    private dockerService: DockerServiceHealthIndicator,
    private dockerImg: DockerImgServiceHealthIndicator,
    private db: SequelizeHealthIndicator,
    private mongo: MongooseHealthIndicator,
    private http: HttpHealthIndicator,
    private asteriskConnection: AsteriskHealthIndicator,
    private asteriskAri: AsteriskAriApplicationHealthIndicator,
    private redis: RedisHealthIndicator,
    private gsm: GsmGatewayHealthIndicator,
    private amocrm: AmocrmHealthIndicator,
  ) {
    this.config = configuration() as ConfigEnvironmentVariables;
  }

  @Get()
  @HealthCheck()
  public async check<T>(formatType: ReturnHealthFormatType): Promise<T> {
    try {
      const result = await this.healthCheckService.check([
        async () => this.db.pingCheck('Asterisk_Cdr_DB_Service', { timeout: 10000 }),
        async () => this.mongo.pingCheck('MongoDB', { timeout: 1000 }),
        async () =>
          this.http.responseCheck('Cdr_Microservice', this.config.cdrMicroservice, async (res) => {
            return res.status === HttpStatus.OK;
          }),

        ...this.customCheck(),
      ]);
      return new HealthFormatResult(result, formatType).format();
    } catch (e) {
      return new HealthFormatResult(e.response, formatType).format();
    }
  }

  private customCheck() {
    return [
      async () => this.amocrm.ping('Amocrm'),
      async () => this.redis.ping('Redis'),
      async () => this.gsm.ping('Gsmgateway'),
      async () => this.asteriskAri.ping('Asterisk_Ari_Application'),
      async () => this.asteriskConnection.ping('Asterisk_Connect'),
      async () => this.dockerService.isHealthy('Docker_Service'),
      async () => this.dockerImg.isHealthy(this.config.selenium.selenoidDockerImg, 'Docker_Selenoid'),
    ];
  }
}

export class HealthFormatResult {
  result: HealthCheckResult;
  formatType: ReturnHealthFormatType;

  constructor(result: HealthCheckResult, formatType: ReturnHealthFormatType) {
    this.result = result;
    this.formatType = formatType;
  }

  public format() {
    return this[this.getMethodByFormatType()]();
  }

  private getMethodByFormatType(): any {
    switch (this.formatType) {
      case ReturnHealthFormatType.http:
        return 'httpFormat';
      case ReturnHealthFormatType.mail:
        return 'mailFormat';
    }
  }

  private httpFormat(): HealthCheckResult {
    return this.result;
  }

  private mailFormat(): HealthCheckMailFormat {
    const mailInfoFormat = [];

    function parseObj(obj: HealthIndicatorResult) {
      Object.keys(obj).forEach((value: string) => {
        mailInfoFormat.push({
          serviceName: value,
          status: obj[value].status,
          detail: !!obj[value].message ? { details: obj[value].message } : {},
        });
      });
    }

    const resultInfo = this.result.status === 'error' ? { ...this.result.info, ...this.result.error } : { ...this.result.info };
    parseObj(resultInfo);

    return {
      status: this.result.status as HealthCheckStatusType,
      service: mailInfoFormat,
    };
  }
}
