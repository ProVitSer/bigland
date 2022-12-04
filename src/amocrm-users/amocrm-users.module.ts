import { Module } from '@nestjs/common';
import { AmocrmUsersService } from './amocrm-users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AmocrmUsers, AmocrmUsersSchema } from './amocrm-users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AmocrmUsers.name, schema: AmocrmUsersSchema },
    ]),
  ],
  providers: [AmocrmUsersService],
  exports: [AmocrmUsersService],
})
export class AmocrmUsersModule {}
