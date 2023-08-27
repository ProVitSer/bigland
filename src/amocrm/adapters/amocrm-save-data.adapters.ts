import { Amocrm } from '../amocrm.schema';
import { ResponseDataAdapter } from './amocrm-response-data.adapter';
import { AmocrmRequestData } from '../interfaces/amocrm.interfaces';

export class AmocrmSaveDataAdapter<T> {
  public amocrmData: Amocrm;
  public readonly responseDataAdapter: ResponseDataAdapter<T>;
  constructor(response: ResponseDataAdapter<T>, request: AmocrmRequestData) {
    this.responseDataAdapter = response;
    this.amocrmData = {
      statusCode: this.responseDataAdapter.statusCode,
      response,
      request,
      stamp: new Date(),
    };
  }
}
