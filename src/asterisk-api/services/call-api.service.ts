import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CallTypeData, ChannelStatusResult, ExtensionOriginalState, HangupCallResult, MonitoringCall, MonitoringCallResult, OriginateCallResult, PozvominCall, PozvonimCallResult, TransferResult } from '../interfaces/asterisk-api.interfaces';
import { AriCallType, HangupReason } from '@app/asterisk/ari/interfaces/ari.enum';
import { AriCallService } from '@app/asterisk/ari/ari-call.service';
import { ChannelStateDTO, HangupCallDTO, OriginateCallDTO } from '../dto';
import { Bridge, Channel, Channels } from 'ari-client';
import { AsteriskCallContext, AsteriskChannelState, AsteriskDisposition, TransferContext } from '../interfaces/asterisk-api.enum';
import { TransferDTO } from '../dto/transfer.dto';
import * as uuid from 'uuid';
import { ExtensionsStateService } from './extensions-state.service';
import { StatusTextExtensionStatus } from '@app/asterisk/ami/interfaces/ami.enum';
import { E164_NUMBER_LENGTH, EXTENSION_CALL_NOT_FOUND, INCORRECT_DST_NUMBER, ORIGINATE_ERROR, PREFIX_TO_ARI_CALL_TYPE, SEARCH_CHANNEL_ERROR } from '../asterisk-api.constants';
import { AsteriskCdrService } from '@app/asterisk-cdr/asterisk-cdr.service';
import { AsteriskCdr } from '@app/asterisk-cdr/asterisk-cdr.entity';
import { AmiActionService } from '@app/asterisk/ami/services/action-service';
import { ChannelsStateDTO } from '../dto/channesl-state.dto';
import { ApiCallDTO } from '../dto/api-call.dto';
import { LogService } from '@app/log/log.service';
import { UtilsService } from '@app/utils/utils.service';
import { TransferTestDTO } from '../dto/transfer-test.dto';
import { AsteriskBaseStatusResponse } from '@app/asterisk/ami/interfaces/ami.interfaces';

@Injectable()
export class CallApiService {
    constructor(
        private readonly ari: AriCallService, 
        private readonly extensionsStateService: ExtensionsStateService,
        private readonly asteriskCdrService: AsteriskCdrService,
        private readonly ami: AmiActionService,
        private readonly log: LogService,
    ) {}

    public async sendMonitoringCall(data: MonitoringCall): Promise<MonitoringCallResult[]> {
        try {

            const result: MonitoringCallResult[] = [];

            for (const number of data.numbers) {

                await this.ari.sendCall({ number }, AriCallType.monitoring);

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

    public async originateApiCall(data: ApiCallDTO){
        try {


            const callTypeData = this.getCallTypeData(data.dst_number);

            const channelInfo = await this.ari.sendCall({ sip_id : data.sip_id, dst_number: callTypeData.number }, callTypeData.type);

            return {
                number: data.dst_number,
                isCallSuccessful: true,
                channelId: channelInfo.id,
            };

        } catch (e) {

            throw e;
            
        }
    }

    private getCallTypeData(number: string): CallTypeData {

        const removeNonDigits = num => num.replace(/\D/g, '');

        const formatToElevenDigits = num => '7' + num.padStart(10, '0').slice(-10);

        const extractMainPart = num => num.slice(3);
      
        number = removeNonDigits(number);
      
        for (const prefix in PREFIX_TO_ARI_CALL_TYPE) {
          if (number.startsWith(prefix)) {
            return {
              type: PREFIX_TO_ARI_CALL_TYPE[prefix],
              number: formatToElevenDigits(extractMainPart(number))
            };
          }
        }
      
        if (number.length === E164_NUMBER_LENGTH && number.startsWith('7')) {

          return { type: AriCallType.apiPozvonim , number: number };

        }
      
        if (number.length === E164_NUMBER_LENGTH && number.startsWith('8')) {

          return { type: AriCallType.apiPozvonim , number: '7' + number.slice(1) };

        }
      
        throw new Error(INCORRECT_DST_NUMBER)
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

    public async channelStatus(data: ChannelStateDTO): Promise<ChannelStatusResult> {
        try {

            const ariChannels =  this.ari.getAriChannels();

            return await this.getChannelStatus(ariChannels, data.channelId);

        } catch (e) {

            throw e;
            
        }
    }

    public async channelsStatus(data: ChannelsStateDTO): Promise<ChannelStatusResult[]> {
        try {

            const ariChannels =  this.ari.getAriChannels();

            const channelStatusResult: ChannelStatusResult[] = [];

            for (const channelId of data.channelIds) { 

                channelStatusResult.push(await this.getChannelStatus(ariChannels, channelId));

            }
            
            return channelStatusResult;

        } catch (e) {

            throw e;
            
        }
    }

    private async getChannelStatus(ariChannels: Channels, channelId: string ): Promise<ChannelStatusResult>{

        return await new Promise<ChannelStatusResult>((resolve) => {

            ariChannels.get({
                channelId,
                }, async  (err: Error, channel: Channel) => {

                if(err) return resolve({ 
                    channelStatus: AsteriskChannelState.Down,
                    callDisposition: await this.getCallDisposition(channelId, channel?.state as AsteriskChannelState)
                });

            

                return resolve({ 
                    channelStatus: channel.state as AsteriskChannelState,
                    callDisposition: await this.getCallDisposition(channelId, channel?.state as AsteriskChannelState)
                });

            });

        });
    }


    private async getCallDisposition(channelId: string, state?: AsteriskChannelState): Promise<AsteriskDisposition> {

        const asteriskCdr = await this.asteriskCdrService.searchOriginateCallInfoInCdr(channelId);

        if(state == AsteriskChannelState.Up) return AsteriskDisposition.ON_CALL;

        if(asteriskCdr.length == 0) return AsteriskDisposition.UNKNOWN;

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
            
            this.log.info(data, CallApiService.name)

            this.checkOriginateApiChannel(data, channelList);

            const extensionChannel = this.getExtensionChannel(data, channelList);

            const bridgeList = await this.ari.getBridgeList();

            this.log.info( { log: "extensionChannel", extensionChannel }, CallApiService.name)

            const originateApiBridge = bridgeList.filter((b: Bridge) => b.channels.includes(data.channelId));

            const channelsCallBridge = bridgeList.filter((b: Bridge) => b.channels.includes(extensionChannel));

            const outgoingChannel = channelList.filter((c: Channel) => channelsCallBridge[0].channels.includes(c.id)).filter((c: Channel) => c.caller.number.length > 5);

            const originateApiBridgeCallBridge = originateApiBridge[0].channels as string[];

            const bridgeOutgoingChannel = outgoingChannel.length > 1 ? outgoingChannel.filter(( oc: Channel) => [AsteriskCallContext.pstn, AsteriskCallContext.gorod].includes(oc.dialplan.context as AsteriskCallContext))[0].id : outgoingChannel[0].id;

            const bridgeResult = await this.ami.bridgeChannels( bridgeOutgoingChannel, originateApiBridgeCallBridge.filter((c: string) => c !== data.channelId)[0]);

            return { isTransferSuccessful: (bridgeResult.response == 'Success') ? true : false } ;


        } catch (e) {

            throw e;
            
        }
    }

    public async transferCalls(data: TransferTestDTO): Promise<TransferResult>{

        const endpointsList =  await this.ari.getAriEndpointsRequest(data.to_extension);
        
        if(endpointsList.channel_ids.length !== 0){

            const resultHangup = await this.hangup({ channelId: endpointsList.channel_ids[0]});

            this.log.info(resultHangup);
        }

        await UtilsService.sleep(5000)

        const channelList = await this.ari.getAriChannelListRequest();

        const extensionChannel = this.getExtensionChannel({ from_extension: data.from_extension, channelId: "" }, channelList);

        const channel = channelList.filter((c: Channel) => c.id == extensionChannel);

        let transferResult: AsteriskBaseStatusResponse<[]>;

        if(channel[0]?.dialplan.context == AsteriskCallContext.dialoutTrunk){

            transferResult = await this.ami.transfer({ channelId: extensionChannel, extension: data.to_extension, transferContext: TransferContext.withHandler });

        } else {

            transferResult = await this.ami.transfer({ channelId: extensionChannel, extension: data.to_extension, transferContext: TransferContext.withoutHandler });

        }


        return { isTransferSuccessful: (transferResult.response == 'Success') ? true : false } ;

        
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