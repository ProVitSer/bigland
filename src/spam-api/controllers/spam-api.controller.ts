import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { CheckOperatorNumbersDTO, CheckNumberDTO } from '../dto/check-spam.dto';
import { SpamApiService } from '../services/spam-api.service';
import { SpamType } from '../interfaces/spam-api.enum';
import { AllOperatorsSpamService } from '../services/all-operators-spam.service';
import { ReportDateDto } from '../dto/report-date.dto';
import * as moment from 'moment';
import { DATE_FROMAT } from '../spam-api.constants';
import { CheckBatchDTO } from '../dto/check-batch.dto';

@UseGuards(RoleGuard([Role.User, Role.Admin]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
@Controller('spam-api')
export class SpamApiController {
  constructor(
    private readonly http: HttpResponseService,
    private readonly spamApiService: SpamApiService,
    private readonly allOperatorsSpamService: AllOperatorsSpamService,
  ) {}

  @Post('check-operator-numbers')
  async checkOperatorNumbers(@Req() req: Request, @Body() body: CheckOperatorNumbersDTO, @Res() res: Response) {
    try {
      const result = await this.spamApiService.checkOperatorNumbers(body, SpamType.checkOperatorNumbers);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('check-batch')
  async checkBatch(@Req() req: Request, @Body() body: CheckBatchDTO, @Res() res: Response) {
    try {
      const result = await this.spamApiService.checkBatch(body);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('check-all')
  async checkAll(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.allOperatorsSpamService.checkAllOperators();
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.FORBIDDEN);
    }
  }

  @Post('check-number')
  async checkNumber(@Req() req: Request, @Body() body: CheckNumberDTO, @Res() res: Response) {
    try {
      const result = await this.spamApiService.checkNumber(body, SpamType.checkNumber);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status/:id')
  async getSpamStatusResult(@Req() req: Request, @Param('id') applicationId: string, @Res() res: Response) {
    try {
      const result = await this.spamApiService.getSpamResultById(applicationId);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw e;
    }
  }

  @Post('stop/:id')
  async stopCheck(@Req() req: Request, @Param('id') applicationId: string, @Res() res: Response) {
    try {
      const result = await this.spamApiService.stopCheck(applicationId);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw e;
    }
  }

  @Get('report')
  async getReport(@Req() req: Request, @Res() res: Response, @Query(ValidationPipe) data?: ReportDateDto) {
    try {
      const result = await this.spamApiService.getSpamReport(data.date || moment().format(DATE_FROMAT));
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw e;
    }
  }
}
