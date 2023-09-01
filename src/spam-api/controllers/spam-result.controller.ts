import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CheckSpamCallResultDTO } from '../dto/amd-spam-call-result.dto';
import { SpamApiService } from '../services/spam-api.service';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { RoleGuard } from '@app/auth/guard/role.guard';
import { Role } from '@app/users/interfaces/users.enum';

@Controller('spam-api')
@UseGuards(RoleGuard([Role.Admin, Role.Asterisk]))
@UseGuards(JwtGuard)
export class SpamResultController {
  constructor(private readonly spamApiService: SpamApiService) {}

  @Post('result')
  async setAmdCallResult(@Body() body: CheckSpamCallResultDTO, @Res() res: Response) {
    this.spamApiService.setCheckNumberResult(body);
    return res.sendStatus(200);
  }
}
