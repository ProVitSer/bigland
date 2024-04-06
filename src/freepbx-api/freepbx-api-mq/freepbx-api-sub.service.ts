import { Injectable } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { QueueTypes, RabbitMqExchange, RoutingKey } from '@app/rabbit/interfaces/rabbit.enum';
import { FreepbxUsersApiService } from '../freepbx-api-users.service';
import { UsersData } from '../interfaces/freepbx-api.interfaces';

@Injectable()
export class FreepbxSubService {
    constructor(private readonly freepbxUsersApiService: FreepbxUsersApiService) {}

    @RabbitSubscribe({
        exchange: RabbitMqExchange.presence,
        queue: QueueTypes.freepbxApi,
        routingKey: RoutingKey.createFreePbxUser,
        queueOptions: {
            channel: 'freepbx-api',
        },
    })
    public async createUserSubHandler(msg: UsersData): Promise<void | Nack> {
        try {

            if (!process.env.NODE_APP_INSTANCE || Number(process.env.NODE_APP_INSTANCE) === 1) {

                console.log(process.env.NODE_APP_INSTANCE, JSON.stringify(msg));

                await this.freepbxUsersApiService.createFreepbxUser(msg);

            } else {

                return new Nack(true);

            }

        } catch (e) {

            return;
            
        }
    }
}