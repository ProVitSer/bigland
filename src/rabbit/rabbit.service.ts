import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { QueueSenderBaseService } from './rabbit-sender-base.service';
import { RabbitMqExchange, RoutingKey } from './interfaces/rabbit.enum';

@Injectable()
export class RabbitPubService extends QueueSenderBaseService {
  constructor(private readonly amqpConnection: AmqpConnection) {
    super();
  }

  public override async sendMessage(exchange: RabbitMqExchange, routingKey: RoutingKey, message: { [key: string]: any }) {
    return await this.amqpConnection.publish(exchange, routingKey, message);
  }

  public async sendMessageWithId(messageId: string, exchange: RabbitMqExchange, routingKey: RoutingKey, message: any) {
    await this.amqpConnection.publish(exchange, routingKey, message, { messageId });
  }
}
