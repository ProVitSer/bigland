import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { HttpResponseService } from '@app/http/http-response';
import { Role } from '@app/users/interfaces/users.enum';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { OperatorsService } from './operators.service';
import { OperatorsNumberDTO } from './dto/add-operator-numbers.dto';
import { OperatorsName } from './interfaces/operators.enum';
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  DeleteeOperatorNumbersResult,
  GetOperatorStruct,
  OperatorsPhones,
  UpdateOperatorNumbersResult,
} from './interfaces/operators.interfaces';

@ApiTags('operators')
@Controller('operators')
@UseGuards(RoleGuard([Role.Admin, Role.Api]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService, private readonly http: HttpResponseService) {}

  @Get('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение данных об операторах и их номерах' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Информация по операторам и их номерам',
    type: OperatorsPhones,
  })
  async getOperators(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.operatorsService.getOperatorsNumbers();
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':operatorName')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение данных по номерам оператора' })
  @ApiParam({ name: 'operatorName', enum: OperatorsName, enumName: 'OperatorsName', description: 'Название оператора' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Информация по номерам оператора',
    type: GetOperatorStruct,
  })
  async getOperatorNumberInfo(@Req() req: Request, @Param('operatorName') operatorName: OperatorsName, @Res() res: Response) {
    try {
      const result = await this.operatorsService.getOperatorNumberInfo(operatorName);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':operatorName/numbers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавление внешних номеров оператора' })
  @ApiBody({ type: OperatorsNumberDTO })
  @ApiParam({ name: 'operatorName', enum: OperatorsName, enumName: 'OperatorsName', description: 'Название оператора' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Результат добавление номеров',
    type: UpdateOperatorNumbersResult,
  })
  async addOperatorNumber(
    @Req() req: Request,
    @Param('operatorName') operatorName: OperatorsName,
    @Body() body: OperatorsNumberDTO,
    @Res() res: Response,
  ) {
    try {
      const result = await this.operatorsService.updateOperatorNumbers(operatorName, body.numbers);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':operatorName/numbers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удаление внешних номеров оператора' })
  @ApiBody({ type: OperatorsNumberDTO })
  @ApiParam({ name: 'operatorName', enum: OperatorsName, enumName: 'OperatorsName', description: 'Название оператора' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Результат удаление номера',
    type: DeleteeOperatorNumbersResult,
  })
  async newDeleteOperatorNumber(
    @Req() req: Request,
    @Param('operatorName') operatorName: OperatorsName,
    @Body() body: OperatorsNumberDTO,
    @Res() res: Response,
  ) {
    try {
      const result = await this.operatorsService.newDeleteOperatorNumber(operatorName, body.numbers);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':operatorName')
  @ApiExcludeEndpoint()
  async deleteOperatorNumber(
    @Req() req: Request,
    @Param('operatorName') operatorName: OperatorsName,
    @Body() body: OperatorsNumberDTO,
    @Res() res: Response,
  ) {
    try {
      const result = await this.operatorsService.deleteOperatorNumber(operatorName, body.numbers);
      return this.http.response(req, res, HttpStatus.OK, result);
    } catch (e) {
      throw new HttpException({ message: e?.message || e }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
