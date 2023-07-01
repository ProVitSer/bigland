import { Module } from '@nestjs/common';
import { BiglandService } from './bigland.service';

@Module({
  providers: [BiglandService],
  exports: [BiglandService],
})
export class BiglandModule {}
