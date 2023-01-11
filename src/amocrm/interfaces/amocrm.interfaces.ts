import { AsteriskCdr } from '@app/asterisk-cdr/asterisk-cdr.entity';
import { ObjectId } from 'mongoose';
import { AmocrmCallStatus, ContactsOrder, DirectionType, TaskTypeId } from './amocrm.enum';

export interface AmocrmGetContactsRequest {
  with?: string;
  page?: number;
  limit?: number;
  query: string;
  order?: ContactsOrder;
}

export interface BasicResponse {
  _page: string;
  _links?: {
    self: {
      href: string;
    };
    next: {
      href: string;
    };
  };
}

export interface AmocrmGetContactsResponse extends BasicResponse {
  _embedded: {
    contacts: AmocrmContact[];
  };
}

export interface AmocrmContact {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  responsible_user_id: number;
  group_id: number;
  created_by: number;
  updated_by: number;
  created_at: number;
  updated_at: number;
  is_deleted: boolean;
  closest_task_at: number;
  custom_fields_values: { [key: string]: any }[] | null;
  account_id: number;
  _embedded: ContactEmbedded;
}

export interface ContactEmbedded {
  tags: Tags[];
  companies: Companies[];
  customers: Customers[];
  leads: Leads[];
  catalog_elements: CatalogElements[];
}

export interface Tags {
  id: number;
  name: string;
}

export interface Companies {
  id: number;
}

export interface Customers {
  id: number;
}

export interface Leads {
  id: number;
}

export interface Contacts {
  id: number;
  is_main?: string;
}

export interface AmocrmCreateContact {
  name: string;
  first_name?: string;
  last_name?: string;
  responsible_user_id: number;
  created_by: number;
  updated_by?: number;
  created_at?: number;
  updated_at?: number;
  custom_fields_values: { [key: string]: any }[];
  _embedded?: {
    tags: Tags[];
  };
  request_id?: string;
}

export interface CatalogElements {
  id: number;
  metadata: object;
  quantity: number;
  catalog_id: number;
  price_id: number;
}

export interface AmocrmCreateLead {
  name: string;
  price?: number;
  status_id: number;
  pipeline_id?: number;
  created_by: number;
  updated_by?: number;
  closed_at?: number;
  created_at?: number;
  updated_at?: number;
  loss_reason_id?: number;
  responsible_user_id: number;
  custom_fields_values: { [key: string]: any }[];
  _embedded?: {
    tags?: Tags[];
    contacts?: Contacts[];
    companies?: Companies[];
  };
}

export interface AmocrmAddCallInfo {
  direction: DirectionType;
  uniq?: string;
  duration: number;
  source: string;
  link?: string;
  phone: string;
  call_result?: string;
  call_status?: AmocrmCallStatus;
  responsible_user_id: number;
  created_by?: number;
  updated_by?: number;
  created_at?: number;
  updated_at?: number;
  request_id?: string;
}

export interface AmocrmAddTasks {
  responsible_user_id: number;
  entity_id?: number;
  entity_type?: string;
  is_completed?: boolean;
  task_type_id?: TaskTypeId;
  text: string;
  duration?: number;
  complete_till: number;
  result?: {
    text: string;
  };
  created_by?: number;
  updated_by?: number;
  created_at?: number;
  updated_at?: number;
  request_id?: string;
}

export interface AmocrmAddCallInfoResponse {
  _total_items: number;
  errors: { [key: string]: any }[];
  _embedded: {
    calls: [
      {
        id: number;
        entity_id: number;
        entity_type: string;
        account_id: number;
        request_id: string;
        _embedded: {
          entity: {
            id: number;
            _links: {
              self: {
                href?: string;
              };
            };
          };
        };
      },
    ];
  };
}

export interface AmocrmCreateContactResponse {
  _links: {
    self: {
      href: string;
    };
  };
  _embedded: {
    contacts: [
      {
        id: number;
        request_id: string;
        _links: {
          self: {
            href: string;
          };
        };
      },
    ];
  };
}

export interface AmocrmCreateLeadResponse {
  _links: {
    self: {
      href: string;
    };
  };
  _embedded: {
    leads: [
      {
        id: number;
        request_id: string;
        _links: {
          self: {
            href: string;
          };
        };
      },
    ];
  };
}

export interface AmocrmCreateTasksResponse {
  _links: {
    self: {
      href: string;
    };
  };
  _embedded: {
    leads: [
      {
        id: number;
        request_id: string;
        _links: {
          self: {
            href: string;
          };
        };
      },
    ];
  };
}

export type AmocrmReponse = AmocrmAddCallInfoResponse | AmocrmCreateTasksResponse | AmocrmCreateLeadResponse | AmocrmCreateContactResponse;

export interface SendCallInfoToCRM {
  cdrId?: ObjectId;
  result: AsteriskCdr;
  amocrmId: number;
  direction: DirectionType;
}
