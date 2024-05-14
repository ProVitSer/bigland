import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AmocrmApiService } from '../services/amocrm-api.service';
import { LogService } from '@app/log/log.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AmocrmDto } from '../dto';

@Controller()
export class AmocrmApiController {
    constructor(private readonly amocrmApiService: AmocrmApiService, private readonly log: LogService) {}

    @Get('amocrm*')
    @ApiExcludeEndpoint()
    async amocrmGet(@Res() res: Response, @Query() query: AmocrmDto) {
        try {

            const result = await this.amocrmApiService.amocrmWidget(query);

            return res.status(HttpStatus.OK).send(result);

        } catch (e) {

            this.log.error(e, AmocrmApiController.name);

            return res.status(HttpStatus.SERVICE_UNAVAILABLE).send(e);
            
        }
    }
}