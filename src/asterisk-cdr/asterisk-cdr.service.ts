import { LogService } from '@app/log/log.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AsteriskCdr } from './asterisk-cdr.entity';
import { Op } from 'sequelize';
import {
  ASTERISK_CDR_INCOMING_CALL_ERROR,
  ASTERISK_CDR_ORIGINATE_CALL_ERROR,
  ASTERISK_CDR_OUTGOING_CALL_ERROR,
  ASTERISK_CDR_POZVONIM_CALL_ERROR,
  CDR_ATTRIBUTES,
} from './asterisk-cdr.constants';
import { ChannelType } from '@app/asterisk/ari/interfaces/ari.enum';
import { AsteriskCallContext } from '@app/asterisk-api/interfaces/asterisk-api.enum';

@Injectable()
export class AsteriskCdrService {
    constructor(
        @InjectModel(AsteriskCdr) private getCallInfo: typeof AsteriskCdr,
        private readonly log: LogService,
    ) {}

    public async searchIncomingCallInfoInCdr(uniqueid: string): Promise<AsteriskCdr[]> {
        try {

            // Костыль по вычленению переведенных вызовов через Позвоним
            const pattern = /^.*;\d$/;

            if (pattern.test(uniqueid)) return this.searchTransferPozvonimIncomingCallInfoInCdr(uniqueid);

            this.log.info(`Входящий вызов ${uniqueid}`, AsteriskCdrService.name);

            const result = await this.getCallInfo.findAll({
                raw: true,
                attributes: CDR_ATTRIBUTES,
                where: {
                    uniqueid: {
                        [Op.like]: uniqueid,
                    },
                },
                order: [
                    ['billsec', 'DESC']
                ],
            });

            this.log.info(result, AsteriskCdrService.name);

            return result;

        } catch (e) {

            this.log.error(`${ASTERISK_CDR_INCOMING_CALL_ERROR}: ${e}`, AsteriskCdrService.name);

            return;

        }
    }

    public async searchTransferPozvonimIncomingCallInfoInCdr(uniqueid: string): Promise<AsteriskCdr[]> {
        try {

            //Костыль по двуканальным вызовам, убираем информацию о них
            const formatUniqueid = uniqueid.includes(';2') ? uniqueid.replace(';2', '') : uniqueid;

            const newUniqueid = formatUniqueid.substring(0, formatUniqueid.length - 5);

            this.log.info(`Переадресованный вызов с Pozvonim ${uniqueid}`, AsteriskCdrService.name);

            const result = await this.getCallInfo.findAll({
                raw: true,
                attributes: CDR_ATTRIBUTES,
                where: {
                    uniqueid: {
                        [Op.like]: `${newUniqueid}%`,
                    },
                    dcontext: {
                        [Op.like]: AsteriskCallContext.local,
                    },
                },
                order: [
                    ['billsec', 'DESC']
                ],
            });

            this.log.info(result, AsteriskCdrService.name);

            return result;

        } catch (e) {

            this.log.error(`${ASTERISK_CDR_INCOMING_CALL_ERROR}: ${e}`, AsteriskCdrService.name);

            return;

        }
    }

    public async searchOutgoingCallInfoInCdr(uniqueid: string): Promise<AsteriskCdr[]> {
        try {

            this.log.info(`Исходящий вызов ${uniqueid}`, AsteriskCdrService.name);

            const result = await this.getCallInfo.findAll({
                raw: true,
                attributes: CDR_ATTRIBUTES,
                where: {
                    uniqueid: {
                        [Op.like]: uniqueid,
                    },
                    dcontext: {
                        [Op.like]: AsteriskCallContext.internal,
                    },
                },
            });

            this.log.info(result, AsteriskCdrService.name);

            return result;

        } catch (e) {

            this.log.error(`${ASTERISK_CDR_OUTGOING_CALL_ERROR}: ${e}`, AsteriskCdrService.name);

            return;

        }
    }

    public async searchPozvonimCallInfoInCdr(uniqueid: string): Promise<AsteriskCdr[]> {
        try {

            this.log.info(`Исходящий вызов Pozvonim ${uniqueid}`, AsteriskCdrService.name);

            const newUniqueid = uniqueid.substring(0, uniqueid.length - 5);

            const result = await this.getCallInfo.findAll({
                raw: true,
                attributes: CDR_ATTRIBUTES,
                where: {
                    uniqueid: {
                        [Op.like]: `${newUniqueid}%`,
                    },
                    dcontext: {
                        [Op.in]: [AsteriskCallContext.pozvonim, AsteriskCallContext.apiGorod, AsteriskCallContext.apiPozvonim, AsteriskCallContext.tollFree],
                    },
                },
            });

            
            // Небольшой костыл, меняем channel с локальным каналом "Local/124997@from-internal-additional-00002a89;1" на реальный канал пользователя "PJSIP/790-0012ec3b"
            const updateResult = result.map((c: AsteriskCdr) => {

                const newChannel = `${ChannelType.PJSIP}/${c.cnum}-0012ec3b`;
                
                return {
                    ...c,
                    channel: newChannel
                };
            }) as AsteriskCdr[];

            this.log.info(updateResult, AsteriskCdrService.name);

            return updateResult;

        } catch (e) {

            this.log.error(`${ASTERISK_CDR_POZVONIM_CALL_ERROR}: ${e}`, AsteriskCdrService.name);

            return;

        }
    }


    public async searchOriginateCallInfoInCdr(uniqueid: string): Promise<AsteriskCdr[]> {
        try {

            this.log.info(`Вызов чере API ${uniqueid}`, AsteriskCdrService.name);

            const newUniqueid = uniqueid.substring(0, uniqueid.length - 5);

            const result = await this.getCallInfo.findAll({
                raw: true,
                attributes: CDR_ATTRIBUTES,
                where: {
                    uniqueid: {
                        [Op.like]: `${newUniqueid}%`,
                    },
                    dcontext: {
                        [Op.like]: AsteriskCallContext.local,
                    },
                   
                }
            });

            this.log.info(result, AsteriskCdrService.name);

            return result;

        } catch (e) {

            this.log.error(`${ASTERISK_CDR_ORIGINATE_CALL_ERROR}: ${e}`, AsteriskCdrService.name);

            return [];

        }
    }

}