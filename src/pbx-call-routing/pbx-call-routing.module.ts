import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RoutingInfoService } from './services/routing-info.service';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AuthModule } from '@app/auth/auth.module';
import { HttpResponseModule } from '@app/http/http.module';
import { LogModule } from '@app/log/log.module';
import { ConfigModule } from '@nestjs/config';
import { PbxCallRoutingController } from './controllers/pbx-call-routing.controller';
import { RouteInfoController } from './controllers/route-info.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PbxCallRouting, PbxCallRoutingSchema } from './pbx-call-routing.schema';
import { OperatorsModule } from '@app/operators/operators.module';
import { PbxCallRoutingModelService } from './services/pbx-call-routing-model.service';
import { PbxCallRoutingService } from './services/pbx-call-routing.service';

@Module({
    imports: [
        ConfigModule,
        LogModule,
        HttpResponseModule,
        AuthModule,
        MongooseModule.forFeature([{
            name: PbxCallRouting.name,
            schema: PbxCallRoutingSchema
        }]),
        OperatorsModule,
    ],
    providers: [RoutingInfoService, PbxCallRoutingModelService, PbxCallRoutingService],
    controllers: [PbxCallRoutingController, RouteInfoController],
    exports: [PbxCallRoutingService],
})
export class PbxCallRoutingModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(LoggerMiddleware, AllowedIpMiddleware)
            .forRoutes(PbxCallRoutingController, RouteInfoController)
    }
}