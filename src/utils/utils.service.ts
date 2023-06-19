import { Injectable } from '@nestjs/common';
import * as uuid from 'uuid';
import { Request } from 'express';
import { DataObject } from '@app/platform-types/common/interfaces';
import { access } from 'fs/promises';
import * as requestIp from 'request-ip';
import { Observable } from 'rxjs';

@Injectable()
export class UtilsService {
  static formatIncomingNumber(number: string): string {
    return number.length == 10 ? number : number.substr(number.length - 10);
  }

  static normalizePhoneNumber(phoneNumber: string): string {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.startsWith('8')) {
      return '7' + digits.slice(1);
    }

    if (digits.startsWith('+7')) {
      return digits.slice(1);
    }

    return digits;
  }

  static normalizeIp(ip: string): string {
    return ip && ip.indexOf('::ffff:') > -1 ? ip.substring(7) : ip;
  }

  static getClientIp(request: Request) {
    return this.normalizeIp(requestIp.getClientIp(request));
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

  static createSetObj(propName: string, setObj: DataObject) {
    const newObj = {};
    for (const key in setObj) {
      newObj[`${propName}.$.${key}`] = setObj[key];
    }
    return newObj;
  }

  static dataToString<T>(data: T): string | undefined | T {
    try {
      if (Array.isArray(data)) {
        return JSON.stringify(data);
      }
      switch (typeof data) {
        case 'string':
          return data;
        case 'number':
        case 'symbol':
        case 'bigint':
        case 'boolean':
        case 'function':
          return data.toString();
        case 'object':
          return JSON.stringify(data);
        default:
          return undefined;
      }
    } catch (e) {
      return data;
    }
  }

  static async isAccessible(path: string): Promise<boolean> {
    return access(path)
      .then(() => true)
      .catch(() => false);
  }

  static getObservableFn<T>(fn: () => Promise<T>, timeout: number): Observable<T> {
    return new Observable<T>((subscriber) => {
      let timer: NodeJS.Timeout;
      (async function getStatus(fn) {
        fn()
          .then((status: any) => {
            timer = setTimeout(() => getStatus(fn), timeout);
            subscriber.next(status);
          })
          .catch((err) => {
            subscriber.error(err);
          });
      })(fn);

      return function unsubscribe() {
        clearTimeout(timer);
      };
    });
  }
}
