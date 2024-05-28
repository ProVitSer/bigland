import { Injectable } from '@nestjs/common';
import { ChannelStatusResult, ExtensionOriginalState, HangupCallResult, MonitoringCall, MonitoringCallResult, OriginateCallResult, PozvominCall, PozvonimCallResult } from '../interfaces/asterisk-api.interfaces';
import { AriCallType, HangupReason } from '@app/asterisk/ari/interfaces/ari.enum';
import { AriCallService } from '@app/asterisk/ari/ari-call.service';
import { ChannelStateDTO, HangupCallDTO, OriginateCallDTO } from '../dto';
import { Channel } from 'ari-client';
import { AsteriskChannelState, AsteriskDisposition } from '../interfaces/asterisk-api.enum';
import { TransferDTO } from '../dto/transfer.dto';
import * as uuid from 'uuid';
import { ExtensionsStateService } from './extensions-state.service';
import { StatusTextExtensionStatus } from '@app/asterisk/ami/interfaces/ami.enum';
import { ORIGINATE_ERROR } from '../asterisk-api.constants';
import { AsteriskCdrService } from '@app/asterisk-cdr/asterisk-cdr.service';
import { AsteriskCdr } from '@app/asterisk-cdr/asterisk-cdr.entity';

@Injectable()
export class CallApiService {
    constructor(
        private readonly ari: AriCallService, 
        private readonly extensionsStateService: ExtensionsStateService,
        private readonly asteriskCdrService: AsteriskCdrService
    ) {}

    public async sendMonitoringCall(data: MonitoringCall): Promise<MonitoringCallResult[]> {
        try {

            const result: MonitoringCallResult[] = [];

            for (const number of data.numbers) {

                await this.ari.sendCall({
                    number
                }, AriCallType.monitoring);

                result.push({
                    number,
                    isCallSuccessful: true,
                });
            };

            return result;

        } catch (e) {

            throw e;

        }
    }

    public async pozvonimOutCall(data: PozvominCall): Promise<PozvonimCallResult> {
        try {

            const channelInfo = await this.ari.sendCall(data, AriCallType.pozvonim);

            return {
                number: data.DST_NUM,
                isCallSuccessful: true,
                channelId: channelInfo.id,
            };

        } catch (e) {

            throw e;
            
        }
    }

    
    public async originate(data: OriginateCallDTO): Promise<OriginateCallResult> {
        try {


            const extensionsState = await this.extensionsStateService.getExtensionOriginalState();

            const filterExtensionState = extensionsState.items.filter( (i: ExtensionOriginalState) => [data.dst_number, data.src_number].includes(i.sip_id))
            
            if(!filterExtensionState.every((es: ExtensionOriginalState) => es.original_extension_state == StatusTextExtensionStatus.Idle)){

                return {
                    isCallOriginate: false,
                    ...this.getOriginateCallInfo(data, filterExtensionState)
                }

            }

            return await this._originate(data, filterExtensionState);

        } catch (e) {

            throw new Error(ORIGINATE_ERROR);
            
        }
    }

    private async _originate(data: OriginateCallDTO, filterExtensionState: ExtensionOriginalState[]): Promise<OriginateCallResult> {
        try {

            const originateData = {
                dstNumber: data.dst_number,
                srcNumber: data.src_number,
                srcChannelId: uuid.v4()
            };
            
            const originateResult =  await this.ari.sendCall(originateData, AriCallType.originate);
    
            return {
                isCallOriginate: true,
                ...this.getOriginateCallInfo(data, filterExtensionState, originateResult.id, originateData.srcChannelId)
            }

        } catch(e){

            throw e;
        }
    }

    private getOriginateCallInfo(data: OriginateCallDTO, filterExtensionState: ExtensionOriginalState[], dstChannelId?: string, srcChannelId?: string): Omit<OriginateCallResult,'isCallOriginate'> {

        return {
            originateCallInfo: {
                originateCallALeg: {
                    dstNumber: data.dst_number,
                    extensionStatus: filterExtensionState.find((es: ExtensionOriginalState) => es.sip_id == data.dst_number).original_extension_state,
                    ...(dstChannelId) ?  { channelId: srcChannelId } : {}
                },
                originateCallBLeg: {
                    srcNumber: data.src_number,
                    extensionStatus: filterExtensionState.find((es: ExtensionOriginalState) => es.sip_id == data.src_number).original_extension_state,
                    ...(srcChannelId) ?  { channelId: dstChannelId } : {}
                }
            }
        }
    }

        
    public async hangup(data: HangupCallDTO): Promise<HangupCallResult> {
        try {

            const ariChannels =  this.ari.getAriChannels();

            return await new Promise<HangupCallResult>((resolve) => {

                ariChannels.hangup({
                    channelId: data.channelId,
                    reason: HangupReason.normal
                }, (err: Error) => {

                    if(err) return resolve({ isCallHangupSuccessful: false });

                    return resolve({ isCallHangupSuccessful: true });

                });

            });

        } catch (e) {

            throw e;
            
        }
    }

    public async channeStatus(data: ChannelStateDTO): Promise<ChannelStatusResult> {
        try {

            const ariChannels =  this.ari.getAriChannels();

            return await new Promise<ChannelStatusResult>((resolve) => {

                ariChannels.get({
                    channelId: data.channelId,
                }, async  (err: Error, channel: Channel) => {

                    if(err) return resolve({ 
                        channelStatus: AsteriskChannelState.Down,
                        callDisposition: await this.getCallDisposition(data, channel?.state as AsteriskChannelState)
                     });

                    

                    return resolve({ 
                        channelStatus: channel.state as AsteriskChannelState,
                        callDisposition: await this.getCallDisposition(data, channel?.state as AsteriskChannelState)
                    });

                });

            });

        } catch (e) {

            throw e;
            
        }
    }

    private async getCallDisposition(data: ChannelStateDTO, state?: AsteriskChannelState): Promise<AsteriskDisposition> {

        const asteriskCdr = await this.asteriskCdrService.searchOriginateCallInfoInCdr(data.channelId);

        if(asteriskCdr.length == 0) return AsteriskDisposition.UNKNOWN;

        if(state == AsteriskChannelState.Up) return AsteriskDisposition.ON_CALL;

        if(asteriskCdr[0].uniqueid == asteriskCdr[0].linkedid){

            return await this.getLebBDisposition(asteriskCdr);

        }

        return await this.getLebADisposition(asteriskCdr);
        
    }


    private async getLebBDisposition(asteriskCdr: AsteriskCdr[]): Promise<AsteriskDisposition>{

        return asteriskCdr[0].disposition as AsteriskDisposition;

    }

    private async getLebADisposition(asteriskCdr: AsteriskCdr[]){

        return asteriskCdr[0].disposition as AsteriskDisposition;

    }


    public async transfer(data: TransferDTO): Promise<void> {
        try {

            const endpoint =  this.ari.getBridge();
            console.log(await endpoint.list())

            // const channels = await endpoint.list();

            // console.log(channels)


            // const batov = channels.filter((c: Channel) => c.caller.number == "442")

            
            // console.log(batov)


            // console.log(batov[0])


        } catch (e) {

            throw e;
            
        }
    }
}