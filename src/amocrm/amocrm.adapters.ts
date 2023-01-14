import { DataObject } from '@app/platform-types/common/interfaces';
import { IAPIResponse } from 'amocrm-js/dist/interfaces/common';
import { ObjectId } from 'mongoose';
import { Amocrm } from './amocrm.schema';

export class ResponseDataAdapter {
  public statusCode: number | undefined;
  public data: DataObject;

  constructor(response: IAPIResponse<unknown>) {
    this.statusCode = response.response.statusCode;
    this.data = response.data;
  }
}

export class AmocrmSaveDataAdapter {
  public amocrmData: Amocrm;
  public readonly responseDataAdapter: ResponseDataAdapter;
  private changed: Date = new Date();
  constructor(private response: ResponseDataAdapter, amocrmRequestData: any, cdrData?: any, cdrId?: ObjectId | undefined) {
    this.responseDataAdapter = response;
    this.amocrmData = {
      cdrId: cdrId || undefined,
      statusCode: this.responseDataAdapter.statusCode,
      amocrmResponseData: this.responseDataAdapter.data,
      amocrmRequestData,
      cdrData: cdrData || {},
      changed: this.changed,
    };
  }
}
