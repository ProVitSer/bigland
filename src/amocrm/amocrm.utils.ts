import { Injectable } from '@nestjs/common';

@Injectable()
export class AmocrmUtilsService {
  static formatIncomingNumber(number: string): string {
    return number.length == 10 ? number : number.substr(number.length - 10);
  }
}
