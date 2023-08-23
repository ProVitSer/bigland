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

@Controller('calling')
export class ProxyCallingResultController {
  constructor(private readonly httpService: HttpService, private readonly utils: ProxyCallingTtsUtils) {}

  @Post('result')
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
@UseGuards(RoleGuard([Role.Admin]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
export class ProxyCallingController {
  constructor(private readonly httpService: HttpService, private readonly utils: ProxyCallingTtsUtils) {}

  @Post('task')
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
@UseGuards(RoleGuard([Role.Admin]))
@UseGuards(JwtGuard)
@UseFilters(HttpExceptionFilter)
export class ProxyTtsController {
  constructor(private readonly httpService: HttpService, private readonly utils: ProxyCallingTtsUtils) {}

  @Post('convert/file')
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
