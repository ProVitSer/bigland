import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AmocrmUsersService } from './amocrm-users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AmocrmUsers, AmocrmUsersSchema } from './amocrm-users.schema';
import { AmocrmSynchUserSchedule } from './schedule/amocrm-sync-user.schedule';
import { LdsModule } from '@app/lds/lds.module';
import { LogModule } from '@app/log/log.module';
import { AmocrmUsersController } from './amocrm-users.controller';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { HttpResponseModule } from '@app/http/http.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        LdsModule,
        LogModule,
        MongooseModule.forFeature([{
            name: AmocrmUsers.name,
            schema: AmocrmUsersSchema
        }]),
        HttpResponseModule,
    ],
    providers: [AmocrmUsersService, AmocrmSynchUserSchedule],
    exports: [AmocrmUsersService],
    controllers: [AmocrmUsersController],
})
export class AmocrmUsersModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(LoggerMiddleware, AllowedIpMiddleware).forRoutes(AmocrmUsersModule);
    }
}