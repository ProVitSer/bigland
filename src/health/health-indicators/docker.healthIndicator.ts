import { DockerService } from '@app/docker/docker.service';
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

@Injectable()
export class DockerServiceHealthIndicator extends HealthIndicator {
  constructor(private readonly docker: DockerService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.docker.checkDocker();
      return super.getStatus(key, true);
    } catch (e) {
      const errorMsg = e;
      throw new HealthCheckError(`${key} failed`, this.getStatus(key, false, { message: errorMsg }));
    }
  }
}

@Injectable()
export class DockerImgServiceHealthIndicator extends HealthIndicator {
  constructor(private readonly docker: DockerService) {
    super();
  }

  async isHealthy(img: string, key: string): Promise<HealthIndicatorResult> {
    try {
      const result = await this.docker.checkImgRunning(img);
      if (!result) throw `Нужный img: ${img} не запущен`;
      return super.getStatus(key, true);
    } catch (e) {
      const errorMsg = e;
      throw new HealthCheckError(`${key} failed`, this.getStatus(key, false, { message: errorMsg }));
    }
  }
}
