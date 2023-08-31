import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { Controller, Get, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { HealthCheck, HealthCheckResult } from '@nestjs/terminus';
import { HealthService } from './health.service';
import { ReturnHealthFormatType } from './interfaces/health.enum';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';

@Controller()
@UseGuards(RoleGuard([Role.Admin, Role.Api]))
@UsePipes(ValidationPipe)
@UseFilters(HttpExceptionFilter)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  @HealthCheck()
  async healthCheck() {
    return await this.healthService.check<HealthCheckResult>(ReturnHealthFormatType.http);
  }
}
