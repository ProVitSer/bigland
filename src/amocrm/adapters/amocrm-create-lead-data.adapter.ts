import { NumberInfo } from '@app/system/system.schema';
import { AmocrmCreateContactResponse, AmocrmCreateLead } from '../interfaces/amocrm.interfaces';
import { ApplicationStage, CreatedById, CustomFieldsValuesId, ResponsibleUserId } from '../interfaces/amocrm.enum';

export class AmocrmCreateLeadDataAdapter {
  public amocrmRequestData: AmocrmCreateLead;
  public incomingNumber: string;
  public incomingTrunk: string | undefined;
  public contactsId: number;
  constructor(incomingNumber: string, numberConfig: NumberInfo, createContactData: AmocrmCreateContactResponse) {
    this.contactsId = createContactData._embedded.contacts[0].id;
    this.incomingNumber = incomingNumber;
    this.incomingTrunk = numberConfig?.trunkNumber;
    this.amocrmRequestData = {
      responsible_user_id: ResponsibleUserId.AdminCC,
      created_by: CreatedById.AdminCC,
      ...this.createLeadStruct(numberConfig),
      _embedded: {
        contacts: [
          {
            id: this.contactsId,
          },
        ],
      },
    };
  }

  private createLeadStruct(numberConfig: NumberInfo | undefined) {
    if (!!numberConfig) {
      return {
        name: numberConfig.createLead.description,
        ...(numberConfig.createLead.pipelineId.length > 0 ? { pipeline_id: Number(numberConfig.createLead.pipelineId) } : {}),
        status_id: Number(numberConfig.createLead.statusId),
        custom_fields_values: numberConfig.createLead.customFieldsValues,
      };
    } else {
      return this.getDefaultStruct();
    }
  }

  private getDefaultStruct() {
    return {
      name: 'MG_CALL',
      status_id: ApplicationStage.DozvonCC,
      custom_fields_values: [
        {
          field_id: CustomFieldsValuesId.LeadsLgTel,
          field_name: 'LG Tel',
          values: [
            {
              value: this.incomingNumber,
            },
          ],
        },
        {
          field_id: CustomFieldsValuesId.TypeRequest,
          field_name: 'Тип Запроса',
          values: [
            {
              value: 'CALL',
            },
          ],
        },
      ],
    };
  }
}
