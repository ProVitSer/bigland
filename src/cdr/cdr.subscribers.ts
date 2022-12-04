import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Cdr } from './cdr.schema';
import { CdrService } from './cdr.service';

@Injectable()
export class CdrMessagingService {
  constructor(private readonly cdrService: CdrService) {}
  @RabbitSubscribe({
    exchange: 'presence',
    queue: 'cdr',
  })
  public async pubSubHandler(msg: Cdr) {
    console.log(`Received message: ${JSON.stringify(msg)}`);
  }
}