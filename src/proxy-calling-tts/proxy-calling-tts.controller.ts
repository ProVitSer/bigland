import { Body, Controller, Get, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { HttpExceptionFilter } from '@app/http/http-exception.filter';
import { ProxyCallingTtsUtils } from './proxy-calling-tts.utils';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

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
@UseGuards(RoleGuard([Role.Admin, Role.Tts]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
export class ProxyCallingController {
  constructor(private readonly httpService: HttpService, private readonly utils: ProxyCallingTtsUtils) {}

  @Post('task')
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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

@Controller('tts')
@UseGuards(RoleGuard([Role.Admin, Role.Tts]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
export class ProxyTtsController {
  constructor(private readonly httpService: HttpService, private readonly utils: ProxyCallingTtsUtils) {}

  @Post('convert/file')
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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
