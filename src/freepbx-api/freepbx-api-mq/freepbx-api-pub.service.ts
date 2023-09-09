import { RabbitPubService } from '@app/rabbit/rabbit.service';
import { Injectable } from '@nestjs/common';
import { RabbitMqExchange, RoutingKey } from '@app/rabbit/interfaces/rabbit.enum';
import { UsersData } from '../interfaces/freepbx-api.interfaces';

@Injectable()
export class FreepbxPubService {
  constructor(private readonly rabbitPubService: RabbitPubService) {}

  public async publishCreateUsersToQueue(data: UsersData[]): Promise<void> {
    try {
      for (const user of data) {
        await this.rabbitPubService.sendMessage(RabbitMqExchange.presence, RoutingKey.createFreePbxUser, user);
      }
    } catch (e) {
      throw e;
    }
  }
}
