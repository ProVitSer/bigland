import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { Controller, Get, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { HealthCheck, HealthCheckResult } from '@nestjs/terminus';
import { HealthService } from './health.service';
import { ReturnHealthFormatType } from './interfaces/health.enum';

@UsePipes(ValidationPipe)
@UseFilters(HttpExceptionFilter)
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  @HealthCheck()
  async healthCheck() {
    return await this.healthService.check<HealthCheckResult>(ReturnHealthFormatType.http);
  }
}
