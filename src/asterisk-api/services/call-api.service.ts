import { Injectable } from '@nestjs/common';
import { ChannelStatusResult, HangupCallResult, MonitoringCall, MonitoringCallResult, OriginateCallResult, PozvominCall, PozvonimCallResult } from '../interfaces/asterisk-api.interfaces';
import { AriCallType, HangupReason } from '@app/asterisk/ari/interfaces/ari.enum';
import { AriCallService } from '@app/asterisk/ari/ari-call.service';
import { ChannelStateDTO, HangupCallDTO, OriginateCallDTO } from '../dto';
import { Channel } from 'ari-client';
import { AsteriskChannelState } from '../interfaces/asterisk-api.enum';

@Injectable()
export class CallApiService {
    constructor(private readonly ari: AriCallService) {}

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

            const channelInfo = await this.ari.sendCall(data, AriCallType.originate);

            return {
                number: data.dst_number,
                isCallSuccessful: true,
                channelId: channelInfo.id,
            };

        } catch (e) {

            throw e;
            
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
                }, (err: Error, channel: Channel) => {

                    if(err) return resolve({ channelStatus: AsteriskChannelState.Down });

                    return resolve({ channelStatus: channel.state as AsteriskChannelState});

                });

            });

        } catch (e) {

            throw e;
            
        }
    }
}