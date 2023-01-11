import { Injectable } from '@nestjs/common';
import * as uuid from 'uuid';
import { Request } from 'express';

@Injectable()
export class UtilsService {
  static formatIncomingNumber(number: string): string {
    return number.length == 10 ? number : number.substr(number.length - 10);
  }

  static replaceChannel(channel: string): string {
    return channel.replace(/(PJSIP\/)(\d{3})-(.*)/, `$2`);
  }

  static checkDstChannel(str: string): boolean {
    const regexp = new RegExp('^PJSIP/[0-9][0-9][0-9]-.*$');
    return regexp.test(str);
  }

  static isGsmChannel(str: string): boolean {
    const regexp = new RegExp('^PJSIP/Zadarma-.*$');
    return regexp.test(str);
  }

  static randomIntFromArray(items: Array<string>): string {
    return items[Math.floor(Math.random() * items.length)];
  }

  static generateId(needUuid?: boolean): string {
    if (!!needUuid) {
      return uuid.v4();
    } else {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
  }

  static sleep(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static generateRandomString(len = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let str = '';
    for (let i = 0; i < len; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
  }

  static generateRandomNumber(len = 4): string {
    const numbers = '123456789';
    let str = '';
    for (let i = 0; i < len; i++) {
      str += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return str;
  }

  static formatNumber(number: string): string {
    return number.length == 12 ? `8${number.slice(2, 12)}` : `8${number.slice(1, 11)}`;
  }

  static stringToArray(str: string): Array<string> {
    return str.split('\n').filter((i) => i != '');
  }

  static getToken(req: Request) {
    try {
      let token = req.headers.authorization;
      if (!token) throw new Error('Проблемы с авторизацией по token');
      if (/Bearer/.test(token)) {
        token = token.split(' ').pop();
      }
      return token;
    } catch (e) {
      throw e;
    }
  }

  static createSetObj(propName: string, setObj: { [key: string]: any }) {
    const newObj = {};
    for (const key in setObj) {
      newObj[`${propName}.$.${key}`] = setObj[key];
    }
    return newObj;
  }
}
