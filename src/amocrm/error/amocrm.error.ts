import { DataObject } from '@app/platform-types/common/interfaces';
import { ResponseDataAdapter } from '../adapters/amocrm-response-data.adapter';

export class AmocrmErrors {

    private static getDetail(response: ResponseDataAdapter < any > ): string[] {

        return response.data?.errors.map((errors: DataObject) => {
            return errors.detail;
        });

    }

    static isNormalBadRequestError<T> (response: ResponseDataAdapter<T> ): boolean {
        try {

            const details = this.getDetail(response);

            return details.some((detail) => {
                return detail === 'Entity not found';
            });

        } catch (e) {

            throw e;
            
        }
    }
}