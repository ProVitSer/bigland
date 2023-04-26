import { LogModule } from '@app/log/log.module';
import { Module } from '@nestjs/common';
import { HttpResponseService } from './http-response';

@Module({
  imports: [LogModule],
  exports: [HttpResponseService],
  providers: [HttpResponseService],
})
export class HttpResponseModule {}
