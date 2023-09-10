import { CreatedById, CustomFieldsValuesEnumId, CustomFieldsValuesId, ResponsibleUserId } from '../interfaces/amocrm.enum';
import { AmocrmCreateContact, AmocrmCreateContactData } from '../interfaces/amocrm.interfaces';

export class AmocrmCreateContactDataAdapter {
  public amocrmRequestData: AmocrmCreateContact;
  public incomingNumber: string;
  constructor(data: AmocrmCreateContactData) {
    this.incomingNumber = data.callData.incomingNumber;
    this.amocrmRequestData = {
      name: `Новый клиент ${data.callData.incomingNumber}`,
      responsible_user_id: ResponsibleUserId.AdminCC,
      created_by: CreatedById.AdminCC,
      custom_fields_values: [
        {
          field_id: CustomFieldsValuesId.ContactsPhone,
          field_name: 'Телефон',
          field_code: 'PHONE',
          values: [
            {
              value: data.callData.incomingNumber,
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
              value: data.numberConfig?.originNumber || data.callData.exten,
            },
          ],
        },
      ],
    };
  }
}
