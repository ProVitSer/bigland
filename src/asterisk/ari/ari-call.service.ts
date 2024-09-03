import { AsteriskAriProvider } from '@app/config/interfaces/config.enum';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import Ari, { Channel } from 'ari-client';
import { AsteriskCallApiUnion } from '@app/asterisk-api/interfaces/asterisk-api.interfaces';
import { AriCallType } from './interfaces/ari.enum';
import { AsteriskAriCall, AsteriskAriCallProviders, AsteriskAriOriginate } from './interfaces/ari.interfaces';
import { MonitoringAriCall, PozvonimAriCall, CheckSpamNumberAriCall, CheckOperatorSpamAriCall } from './providers';
import { OriginateCall } from './providers/originate';
import { ApiPozvonimAriCall } from './providers/api-pozvonim';
import { ApiGorodAriCall } from './providers/api-gorod';
import { ApiTollFreeAriCall } from './providers/api-toll-free';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AriAsteriskEnvironmentVariables, AsteriskEnvironmentVariables } from '@app/config/interfaces/config.interface';

@Injectable()
export class AriCallService implements OnApplicationBootstrap {
    private client: {
        ariClient: Ari.Client
    };
    constructor(
        @Inject(AsteriskAriProvider.aricall) private readonly ari: {
            ariClient: Ari.Client
        },
        private readonly monitoring: MonitoringAriCall,
        private readonly pozvonim: PozvonimAriCall,
        private readonly checkSpamNumber: CheckSpamNumberAriCall,
        private readonly checkOperatorSpam: CheckOperatorSpamAriCall,
        private readonly originateCall: OriginateCall,
        private readonly apiPozvonim: ApiPozvonimAriCall,
        private readonly apiGorodAriCall: ApiGorodAriCall,
        private readonly apiTollFreeAriCall: ApiTollFreeAriCall,
        private httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    private get providers(): AsteriskAriCallProviders {
        return {
            [AriCallType.monitoring]: this.monitoring,
            [AriCallType.pozvonim]: this.pozvonim,
            [AriCallType.checkSpamNumber]: this.checkSpamNumber,
            [AriCallType.checkOperatorSpam]: this.checkOperatorSpam,
            [AriCallType.originate]: this.originateCall,
            [AriCallType.apiPozvonim]: this.apiPozvonim,
            [AriCallType.apiGorod]: this.apiGorodAriCall,
            [AriCallType.apiTollFree]: this.apiTollFreeAriCall,

        };
    }

    public async onApplicationBootstrap() {
        this.client = this.ari;
    }

    public async sendCall(data: AsteriskCallApiUnion, callType: AriCallType): Promise<Ari.Channel> {
        try {

            const provider = this.getProvider(callType);

            const originateInfo = await provider.getOriginateInfo(data, this.client.ariClient);

            return await this.sendAriCall(originateInfo);

        } catch (e) {

            throw e;

        }
    }

    private getProvider(callType: AriCallType): AsteriskAriCall {

        return this.providers[callType];

    }

    private async sendAriCall(originateInfo: AsteriskAriOriginate): Promise<Channel> {

        const channel = this.client.ariClient.Channel();

        return await channel.originate({
            ...originateInfo,
        });

    }

    public getAriChannels(): Ari.Channels {

        return this.client.ariClient.channels;
        
    }

    public async getAriChannelList(): Promise<Ari.Channel[]> {

        const channel = this.client.ariClient.Channel();
        
        return await channel.list();

    }

    public async getBridgeList(): Promise<Ari.Bridge[]> {

        const bridge =  this.client.ariClient.Bridge();

        return await bridge.list();

    }


    public async getAriEndpoints(): Promise<Ari.Endpoints> {

        return this.client.ariClient.endpoints;

    }


    public async getAriEndpointsRequest(extension: string): Promise<Ari.Endpoint> {

        const { ari } = this.configService.get('asterisk') as AsteriskEnvironmentVariables;

        const ariCall = ari.filter((a: AriAsteriskEnvironmentVariables) => a.user == 'aricall');

        const result = await firstValueFrom(
            this.httpService.get(`${ariCall[0].url}/ari/endpoints/PJSIP/${extension}?api_key=${ariCall[0].user}:${ariCall[0].password}`).pipe(
                catchError((e: AxiosError) => {
                    throw e;
                }),
            ),
        );

        return result.data as Ari.Endpoint;

    }

    public async getAriChannelListRequest(): Promise<Ari.Channel[]> {

        const { ari } = this.configService.get('asterisk') as AsteriskEnvironmentVariables;

        const ariCall = ari.filter((a: AriAsteriskEnvironmentVariables) => a.user == 'aricall');

        const result = await firstValueFrom(
            this.httpService.get(`${ariCall[0].url}/ari/channels?api_key=${ariCall[0].user}:${ariCall[0].password}`).pipe(
                catchError((e: AxiosError) => {
                    throw e;
                }),
            ),
        );

        return result.data as Ari.Channel[];

    }
}