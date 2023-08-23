import { AsteriskCdr } from '@app/asterisk-cdr/asterisk-cdr.entity';
import { IAPIResponse } from 'amocrm-js/dist/interfaces/common';
import { Amocrm } from '../amocrm.schema';
import { AmocrmSaveData } from '../interfaces/amocrm.interfaces';

export class ResponseDataAdapter<T> {
  public statusCode: number | undefined;
  public data: T;

  constructor(response: IAPIResponse<T>) {
    this.statusCode = response.response.statusCode;
    this.data = response.data;
  }
}

export class AmocrmSaveDataAdapter<T> {
  public amocrmData: Amocrm;
  public readonly responseDataAdapter: ResponseDataAdapter<T>;
  private changed: Date = new Date();
  constructor(responseData: ResponseDataAdapter<T>, saveData: AmocrmSaveData) {
    this.responseDataAdapter = responseData;
    this.amocrmData = {
      cdrId: saveData?.cdrId,
      statusCode: this.responseDataAdapter.statusCode,
      amocrmResponseData: this.responseDataAdapter.data,
      amocrmRequestData: saveData.amocrmRequestData,
      cdrData: saveData?.cdrData || ({} as AsteriskCdr),
      changed: this.changed,
    };
  }
}
