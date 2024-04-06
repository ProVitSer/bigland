export enum ContactsOrder {
    update = 'updated_at',
    id = 'id',
}

export enum AmocrmAPIV2 {
    auth = '/private/api/auth.php?type=json',
    account = '/private/api/v2/account',
    events = '/api/v2/events/',
}

export enum AmocrmAPIV4 {
    contacts = '/api/v4/contacts',
    leads = '/api/v4/leads',
    account = '/api/v4/account',
    call = '/api/v4/calls',
    tasks = '/api/v4/tasks',
}

export enum HttpMethod {
    get = 'GET',
    port = 'POST',
}

export enum PbxCallStatus {
    ANSWERED = 'ANSWERED',
    NOANSWER = 'NO ANSWER',
    BUSY = 'BUSY',
}

export enum DirectionType {
    inbound = 'inbound',
    outbound = 'outbound',
}

export enum AmocrmCallStatus {
    Message = 1,
    CallBackLater = 2,
    Absent = 3,
    Answer = 4,
    WrongNumber = 5,
    NoAnswer = 6,
    Busy = 7,
}

export enum ResponsibleUserId {
    AdminCC = 6019824,
    AdminNotWork = 3779682,
}

export enum CreatedById {
    AdminCC = 6990255,
}

export enum CustomFieldsValuesId {
    ContactsPhone = 783578,
    LeadsLgTel = 1288762,
    ContactsLgTel = 1288764,
    Village = 1274981,
    TypeRequest = 1274979,
}

export enum CustomFieldsValuesEnumId {
    Number = 1760384,
    VillageNumber = 2947510,
    DolinaVauzi = 2957698,
}

export enum ApplicationStage {
    DozvonCC = 14222500,
    OstavilZayavku = 14222500,
}

export enum PipelineId {
    MGSale = 519481,
    Village = 4589241,
}

export enum TaskTypeId {
    NewLead = 343570,
}

export enum AmocrmV2EventType {
    phoneCall = 'phone_call',
}