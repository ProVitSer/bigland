import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { ApiHttpExceptionFilter } from '@app/http/http-exception.filter';
import { ProxyCallingTtsUtils } from './proxy-calling-tts.utils';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Calling,
  CallingTTSTask,
  CallingTaskModifyResult,
  CallingTaskUpdateVoiceFile,
  ListVoicesData,
  TTS,
  TTSFile,
  TTSVoices,
} from './interfaces/proxy-calling-tts.interfaces';
import { ApplicationId } from '@app/bigland/interfaces/bigland.interfaces';

@Controller('calling')
@UseGuards(RoleGuard([Role.Admin, Role.Asterisk]))
@UseGuards(JwtGuard)
export class ProxyCallingResultController {
    constructor(private readonly httpService: HttpService, private readonly utils: ProxyCallingTtsUtils) {}

    @Post('result')
    @ApiExcludeEndpoint()
    async result(@Req() req: Request, @Body() requestData: any, @Res() res: Response) {
        try {
            const result = await firstValueFrom(
                this.httpService.post(this.utils.getCallingTtsUrl(req.path), requestData).pipe(
                    catchError((e: AxiosError) => {
                        throw e;
                    }),
                ),
            );
            return res.status(result.status).json(result.data);
        } catch (e) {
            return res.status(e.response.status).json(e.response.data);
        }
    }
}

@Controller('calling')
@ApiTags('calling')
@UseGuards(RoleGuard([Role.Admin, Role.Tts]))
@UseGuards(JwtGuard)
@UseFilters(ApiHttpExceptionFilter)
export class ProxyCallingController {
    constructor(private readonly httpService: HttpService, private readonly utils: ProxyCallingTtsUtils) {}

    @Post('task')
    @ApiBearerAuth()
    @ApiBody({
        type: CallingTTSTask
    })
    @ApiOperation({
        summary: 'Создание задачи на обзвон по списку и озвучкой переданного текста'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Уникальный идентификатор обзвона',
        type: ApplicationId,
    })
    async setCallingTask(@Req() req: Request, @Body() requestData: any, @Res() res: Response) {
        try {

            const result = await firstValueFrom(
                this.httpService.post(this.utils.getCallingTtsUrl(req.path), requestData).pipe(
                    catchError((e: AxiosError) => {
                        throw e;
                    }),
                ),
            );

            return res.status(result.status).json(result.data);

        } catch (e) {

            return res.status(e.response.status).json(e.response.data);

        }
    }

    @Post('task/stop')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Остановить выполнение ранее запущенной задачи на обзвон'
    })
    @ApiBody({
        type: ApplicationId
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат выполнения',
        type: CallingTaskModifyResult,
    })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Задача с запрашиваемым applicationId не найден',
    })
    async stopTask(@Req() req: Request, @Body() requestData: any, @Res() res: Response) {
        try {

            const result = await firstValueFrom(
                this.httpService.post(this.utils.getCallingTtsUrl(req.path), requestData).pipe(
                    catchError((e: AxiosError) => {
                        throw e;
                    }),
                ),
            );

            return res.status(result.status).json(result.data);

        } catch (e) {

            return res.status(e.response.status).json(e.response.data);

        }
    }

    @Post('task/cancel')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Отменить выполнение ранее запущенной задачи на обзвон'
    })
    @ApiBody({
        type: ApplicationId
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат выполнения',
        type: CallingTaskModifyResult,
    })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Задача с запрашиваемым applicationId не найден',
    })
    async cancelTask(@Req() req: Request, @Body() requestData: any, @Res() res: Response) {
        try {

            const result = await firstValueFrom(
                this.httpService.post(this.utils.getCallingTtsUrl(req.path), requestData).pipe(
                    catchError((e: AxiosError) => {
                        throw e;
                    }),
                ),
            );

            return res.status(result.status).json(result.data);

        } catch (e) {

            return res.status(e.response.status).json(e.response.data);

        }
    }

    @Post('task/continue')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Продолжить выполнение ранее остановленной задачи на обзвон'
    })
    @ApiBody({
        type: ApplicationId
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат выполнения',
        type: CallingTaskModifyResult,
    })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Задача с запрашиваемым applicationId не найден',
    })
    async continueTask(@Req() req: Request, @Body() requestData: any, @Res() res: Response) {
        try {

            const result = await firstValueFrom(
                this.httpService.post(this.utils.getCallingTtsUrl(req.path), requestData).pipe(
                    catchError((e: AxiosError) => {
                        throw e;
                    }),
                ),
            );

            return res.status(result.status).json(result.data);

        } catch (e) {

            return res.status(e.response.status).json(e.response.data);

        }
    }

    @Post('task/update/voice-file')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Обновить голосовой файл по остановленной задаче'
    })
    @ApiBody({
        type: CallingTaskUpdateVoiceFile
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Результат выполнения',
        type: CallingTaskModifyResult,
    })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Задача с запрашиваемым applicationId не найден',
    })
    async updteFileTask(@Req() req: Request, @Body() requestData: any, @Res() res: Response) {
        try {

            const result = await firstValueFrom(
                this.httpService.post(this.utils.getCallingTtsUrl(req.path), requestData).pipe(
                    catchError((e: AxiosError) => {
                        throw e;
                    }),
                ),
            );

            return res.status(result.status).json(result.data);

        } catch (e) {

            return res.status(e.response.status).json(e.response.data);

        }
    }

    @Get('task/result/:applicationId')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Получение результата обзвона по задаче'
    })
    @ApiParam({
        name: 'applicationId',
        required: true,
        description: 'Уникальный идентификатор задачи существующий в базе данных',
        type: String,
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Уникальный идентификатор обзвона',
        type: Calling,
    })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Задача с запрашиваемым applicationId не найден',
    })
    async getTaskResult(@Req() req: Request, @Res() res: Response) {
        try {

            const result = await firstValueFrom(
                this.httpService.get(this.utils.getCallingTtsUrl(req.path)).pipe(
                    catchError((e: AxiosError) => {
                        throw e;
                    }),
                ),
            );

            return res.status(result.status).json(result.data);

        } catch (e) {

            return res.status(e.response.status).json(e.response.data);

        }
    }
}

@ApiTags('tts')
@Controller('tts')
@UseGuards(RoleGuard([Role.Admin, Role.Tts]))
@UseGuards(JwtGuard)
@UseFilters(ApiHttpExceptionFilter)
export class ProxyTtsController {
    constructor(private readonly httpService: HttpService, private readonly utils: ProxyCallingTtsUtils) {}

    @Post('convert/file')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Преобразовать текст в голосовой файл'
    })
    @ApiBody({
        type: TTS
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Уникальный идентификатор голосового файла в системе',
        type: TTSFile,
    })
    async convertFile(@Req() req: Request, @Body() requestData: any, @Res() res: Response) {
        try {

            const result = await firstValueFrom(
                this.httpService.post(this.utils.getCallingTtsUrl(req.path), requestData).pipe(
                    catchError((e: AxiosError) => {
                        throw e;
                    }),
                ),
            );

            return res.status(result.status).json(result.data);

        } catch (e) {

            return res.status(e.response.status).json(e.response.data);

        }
    }

    @Post('voices')
    @ApiBearerAuth()
    @ApiBody({
        type: TTSVoices
    })
    @ApiOperation({
        summary: 'Получение списка возможных голосов и эмоций'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Уникальный идентификатор голосового файла в системе',
        type: [ListVoicesData],
    })
    async getVoicesList(@Req() req: Request, @Body() requestData: any, @Res() res: Response) {
        try {

            const result = await firstValueFrom(
                this.httpService.post(this.utils.getCallingTtsUrl(req.path), requestData).pipe(
                    catchError((e: AxiosError) => {
                        throw e;
                    }),
                ),
            );

            return res.status(result.status).json(result.data);

        } catch (e) {

            return res.status(e.response.status).json(e.response.data);

        }
    }

    @Post('convert/online')
    @ApiBearerAuth()
    @ApiBody({
        type: TTS
    })
    @ApiOperation({
        summary: 'Озвучка заданного переданного текста'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Stream voice file response',
        content: {
            'application/octet-stream': {},
        },
    })
    async convertOnline(@Req() req: Request, @Body() requestData: any, @Res() res: Response) {
        try {

            const result = await firstValueFrom(
                this.httpService
                .post(this.utils.getCallingTtsUrl(req.path), requestData, {
                    responseType: 'stream',
                })
                .pipe(
                    catchError((e: AxiosError) => {
                        throw e;
                    }),
                ),
            );

            result.data.pipe(res);

        } catch (e) {

            return res.status(e.response.status).json(e.response.data);

        }
    }

    @Get('file/:fileId')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Получение ранее преобразованного через tts звукового файла по fileId'
    })
    @ApiParam({
        name: 'fileId',
        required: true,
        description: 'Уникальный идентификатор преобразованного tts файла',
        type: String,
    })
    @ApiOkResponse({
        status: HttpStatus.OK,
        description: 'Stream voice file response',
        content: {
            'application/octet-stream': {},
        },
    })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Файл с запрашиваемым fileId не найден',
    })
    async getTTSFile(@Req() req: Request, @Res() res: Response) {
        try {

            const result = await firstValueFrom(
                this.httpService
                .get(this.utils.getCallingTtsUrl(req.path), {
                    responseType: 'stream',
                })
                .pipe(
                    catchError((e: AxiosError) => {
                        throw e;
                    }),
                ),
            );

            result.data.pipe(res);

        } catch (e) {

            return res.status(e.response.status).json(e.response.data);
            
        }
    }
}