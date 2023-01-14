import { MiddlewareConsumer, Module } from '@nestjs/common';
import * as namiLib from 'nami';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GsmGatewayApiController } from './gsm-gateway-api.controller';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { UpdateSMSSendEventParser } from './gsm/update-sms-send-event-parser';
import { GsmPortsActionService, GsmSendSMSActionService, GsmUSSDActionService } from './gsm/gsm-action-service';
import { GsmGateway } from './gsm-gateway';
import { ReceivedSMSEventParser } from './gsm/received-sms-event-parser';
import { HttpResponseModule } from '@app/http/http.module';
import { AllowedIpMiddleware } from '@app/middleware/allowedIp.middleware';
import { LogModule } from '@app/log/log.module';
import { SendSmsScheduleService } from './sms/send-sms-schedule.service';
import { SmsService } from './sms/sms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Sms, SmsSchema } from './sms/sms.schema';
import { SystemModule } from '@app/system/system.module';
import { createGsmGatewayAmi, getGsmGatewayProvidesName } from '@app/config/project-configs/gsm-gateway.config';

const gsmGatewayAmiProviders = createGsmGatewayAmi();
const providersName = getGsmGatewayProvidesName();

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: Sms.name, schema: SmsSchema }]), LogModule, HttpResponseModule, SystemModule],
  providers: [
    ...gsmGatewayAmiProviders,
    GsmGateway,
    UpdateSMSSendEventParser,
    ReceivedSMSEventParser,
    GsmSendSMSActionService,
    GsmPortsActionService,
    GsmUSSDActionService,
    SendSmsScheduleService,
    SmsService,
  ],
  exports: [
    ...providersName,
    GsmGateway,
    UpdateSMSSendEventParser,
    ReceivedSMSEventParser,
    GsmSendSMSActionService,
    GsmPortsActionService,
    GsmUSSDActionService,
  ],
  controllers: [GsmGatewayApiController],
})
export class GsmGatewayApiModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware, AllowedIpMiddleware).forRoutes(GsmGatewayApiController);
  }
}
