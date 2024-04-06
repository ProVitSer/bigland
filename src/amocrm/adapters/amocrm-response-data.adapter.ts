import { IAPIResponse } from 'amocrm-js/dist/interfaces/common';

export class ResponseDataAdapter<T> {
    public statusCode: number | undefined;
    public data: T;

    constructor(response: IAPIResponse<T> ) {
        this.statusCode = response.response.statusCode;
        this.data = response.data;
    }
}
