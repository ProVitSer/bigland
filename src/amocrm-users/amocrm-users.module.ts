import { Module } from '@nestjs/common';
import { AmocrmUsersService } from './amocrm-users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AmocrmUsers, AmocrmUsersSchema } from './amocrm-users.schema';
import { AmocrmSynchUserSchedule } from './schedule/amocrm-sync-user.schedule';
import { LdsModule } from '@app/lds/lds.module';
import { LogModule } from '@app/log/log.module';

@Module({
  imports: [LdsModule, LogModule, MongooseModule.forFeature([{ name: AmocrmUsers.name, schema: AmocrmUsersSchema }])],
  providers: [AmocrmUsersService, AmocrmSynchUserSchedule],
  exports: [AmocrmUsersService],
})
export class AmocrmUsersModule {}
