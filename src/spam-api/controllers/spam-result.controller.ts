import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CheckSpamCallResultDTO } from '../dto/amd-spam-call-result.dto';
import { SpamApiService } from '../services/spam-api.service';

@Controller('spam-api')
export class SpamResultController {
  constructor(private readonly spamApiService: SpamApiService) {}

  @Post('result')
  async setAmdCallResult(@Body() body: CheckSpamCallResultDTO, @Res() res: Response) {
    this.spamApiService.setCheckNumberResult(body);
    return res.sendStatus(200);
  }
}
