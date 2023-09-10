import { Injectable } from '@nestjs/common';
import {
  AmocrmAddCallInfo,
  AmocrmAddTasks,
  AmocrmCreateContact,
  AmocrmCreateLead,
  AmocrmGetRequest,
  AmocrmV4ApiMethod,
} from '@app/amocrm/interfaces/amocrm.interfaces';
import { AmocrmV4RequestService } from './amocrm-v4-request.service';
import { AmocrmAPIV4 } from '@app/amocrm/interfaces/amocrm.enum';
import { IAPIResponse } from 'amocrm-js/dist/interfaces/common';

@Injectable()
export class AmocrmV4ApiService implements AmocrmV4ApiMethod {
  constructor(private readonly amocrmV4RequestService: AmocrmV4RequestService) {}

  public async createTask<T>(amocrmRequestData: AmocrmAddTasks): Promise<IAPIResponse<T>> {
    return await this.amocrmV4RequestService.amocrmPostRequest<T>(AmocrmAPIV4.tasks, amocrmRequestData);
  }

  public async sendCallInfo<T>(amocrmRequestData: AmocrmAddCallInfo): Promise<IAPIResponse<T>> {
    return await this.amocrmV4RequestService.amocrmPostRequest<T>(AmocrmAPIV4.call, amocrmRequestData);
  }

  public async searchContact<T>(data: AmocrmGetRequest): Promise<IAPIResponse<T>> {
    return await this.amocrmV4RequestService.amocrmGetRequest<T>(AmocrmAPIV4.contacts, data);
  }

  public async createContact<T>(amocrmRequestData: AmocrmCreateContact): Promise<IAPIResponse<T>> {
    return await this.amocrmV4RequestService.amocrmPostRequest<T>(AmocrmAPIV4.contacts, amocrmRequestData);
  }

  public async createLeads<T>(amocrmRequestData: AmocrmCreateLead): Promise<IAPIResponse<T>> {
    return await this.amocrmV4RequestService.amocrmPostRequest<T>(AmocrmAPIV4.leads, amocrmRequestData);
  }
}
