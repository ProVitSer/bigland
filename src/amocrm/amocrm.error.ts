import { DataObject } from '@app/platform-types/common/interfaces';
import { ResponseDataAdapter } from './amocrm.adapters';

export class AmocrmErrors {
  private static getDetail(response: ResponseDataAdapter): string[] {
    return response.data?.errors.map((errors: DataObject) => {
      return errors.detail;
    });
  }

  static isNormalBadRequestError(response: ResponseDataAdapter): boolean {
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
