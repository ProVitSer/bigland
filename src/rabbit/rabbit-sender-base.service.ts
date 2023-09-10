import { Injectable } from '@nestjs/common';
import { RabbitMqExchange, RoutingKey } from './interfaces/rabbit.enum';

@Injectable()
export abstract class QueueSenderBaseService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async sendMessage(_exchange: RabbitMqExchange, _routingKey: RoutingKey, _message: { [key: string]: any }) {
    await Promise.resolve([]);
  }
}
