import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChannelStatusResult, ExtensionOriginalState, HangupCallResult, MonitoringCall, MonitoringCallResult, OriginateCallResult, PozvominCall, PozvonimCallResult, TransferResult } from '../interfaces/asterisk-api.interfaces';
import { AriCallType, HangupReason } from '@app/asterisk/ari/interfaces/ari.enum';
import { AriCallService } from '@app/asterisk/ari/ari-call.service';
import { ChannelStateDTO, HangupCallDTO, OriginateCallDTO } from '../dto';
import { Bridge, Channel } from 'ari-client';
import { AsteriskChannelState, AsteriskDisposition } from '../interfaces/asterisk-api.enum';
import { TransferDTO } from '../dto/transfer.dto';
import * as uuid from 'uuid';
import { ExtensionsStateService } from './extensions-state.service';
import { StatusTextExtensionStatus } from '@app/asterisk/ami/interfaces/ami.enum';
import { EXTENSION_CALL_NOT_FOUND, ORIGINATE_ERROR, SEARCH_CHANNEL_ERROR } from '../asterisk-api.constants';
import { AsteriskCdrService } from '@app/asterisk-cdr/asterisk-cdr.service';
import { AsteriskCdr } from '@app/asterisk-cdr/asterisk-cdr.entity';
import { AmiActionService } from '@app/asterisk/ami/services/action-service';

@Injectable()
export class CallApiService {
    constructor(
        private readonly ari: AriCallService, 
        private readonly extensionsStateService: ExtensionsStateService,
        private readonly asteriskCdrService: AsteriskCdrService,
        private readonly ami: AmiActionService
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


    public async transfer(data: TransferDTO): Promise<TransferResult> {
        try {

            const channelList =  await this.ari.getAriChannelList();

            this.checkOriginateApiChannel(data, channelList);

            const extensionChannel = this.getExtensionChannel(data, channelList);

            const bridgeList = await this.ari.getBridgeList();

            const originateApiBridge = bridgeList.filter((b: Bridge) => b.channels.includes(data.channelId));

            const channelsCallBridge = bridgeList.filter((b: Bridge) => b.channels.includes(extensionChannel));

            const outgoingChannel = channelList.filter((c: Channel) => channelsCallBridge[0].channels.includes(c.id)).filter((c: Channel) => c.caller.number.length > 5)

            const originateApiBridgeCallBridge = originateApiBridge[0].channels as string[];

            const bridgeResult = await this.ami.bridgeChannels( outgoingChannel[0].id , originateApiBridgeCallBridge.filter((c: string) => c !== data.channelId)[0]);

            return { isTransferSuccessful: (bridgeResult.response == 'Success') ? true : false } ;


        } catch (e) {

            throw e;
            
        }
    }

    private checkOriginateApiChannel(data: TransferDTO, channels: Channel[]): void {

        const originateApiChannel = channels.filter((c: Channel) => c.id == data.channelId);

        if(originateApiChannel.length == 0) throw new HttpException({ message: `${SEARCH_CHANNEL_ERROR} : ${data.channelId}` }, HttpStatus.NOT_FOUND);

    }

    private getExtensionChannel(data: TransferDTO, channels: Channel[]): string{

        const callChannelByNumber = channels.filter((c: Channel) => c.caller.number == data.from_extension);

        const regexp = new RegExp(`^PJSIP/${data.from_extension}-.*$`);

        const callChannelByName = channels.filter((c: Channel) => regexp.test(c.name));

        if(callChannelByNumber.length == 0 && callChannelByName.length == 0)  throw new HttpException({ message: `${EXTENSION_CALL_NOT_FOUND} : ${data.from_extension}` }, HttpStatus.NOT_FOUND); 
    
        return callChannelByNumber[0]?.id || callChannelByName[0]?.id;

    }
}