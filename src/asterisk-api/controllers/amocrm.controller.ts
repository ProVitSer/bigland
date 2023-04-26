import { Controller, Get, Query, Req, Res, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmocrmDto } from '../dto/amocrm.dto';
import { Request, Response } from 'express';
import { AmocrmApiService } from '../services/amocrm-api.service';
import { LogService } from '@app/log/log.service';

@Controller()
export class AmocrmApiController {
  constructor(
    private readonly amocrmApiService: AmocrmApiService,
    private readonly log: LogService,
    private readonly config: ConfigService,
  ) {}

  @Get('amocrm*')
  async amocrmGet(@Req() req: Request, @Res() res: Response, @Query() query: AmocrmDto) {
    if (query._login == this.config.get('amocrm.widget.login') && query._secret == this.config.get('amocrm.widget.secret')) {
      try {
        const result = await this.amocrmApiService.amocrmWidget(query);
        return res.status(HttpStatus.OK).send(result);
      } catch (e) {
        this.log.error(e, AmocrmApiController.name);
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).send(e);
      }
    }
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({});
  }
}
