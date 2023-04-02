import { NumberInfo } from '@app/system/system.schema';
import { CreatedById, CustomFieldsValuesEnumId, CustomFieldsValuesId, ResponsibleUserId } from '../interfaces/amocrm.enum';
import { AmocrmCreateContact } from '../interfaces/amocrm.interfaces';
import { DEFAULT_NUMBER } from '../amocrm.constants';

export class AmocrmCreateContactDataAdapter {
  public amocrmRequestData: AmocrmCreateContact;
  public incomingNumber: string;
  constructor(incomingNumber: string, numberConfig: NumberInfo | undefined) {
    this.incomingNumber = incomingNumber;
    this.amocrmRequestData = {
      name: `Новый клиент ${incomingNumber}`,
      responsible_user_id: ResponsibleUserId.AdminCC,
      created_by: CreatedById.AdminCC,
      custom_fields_values: [
        {
          field_id: CustomFieldsValuesId.ContactsPhone,
          field_name: 'Телефон',
          field_code: 'PHONE',
          values: [
            {
              value: incomingNumber,
              enum_id: CustomFieldsValuesEnumId.Number,
              enum_code: 'MOB',
            },
          ],
        },
        {
          field_id: CustomFieldsValuesId.ContactsLgTel,
          field_name: 'LG Tel',
          field_code: null,
          values: [
            {
              value: numberConfig?.originNumber || DEFAULT_NUMBER,
            },
          ],
        },
      ],
    };
  }
}
