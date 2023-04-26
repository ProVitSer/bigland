export enum SmsStatusDescription {
  successful = 'successful',
  failure = 'failure',
  waiting = 'waiting',
  scheduled = 'scheduled',
}

export enum SmsType {
  outgoing = 'outgoing',
  incoming = 'incoming',
}

export enum GsmGatewaykEventType {
  UpdateSMSSend = 'UpdateSMSSend',
  ReceivedSMSEvent = 'ReceivedSMSEvent',
}

export enum Operators {
  mts = 'MTS',
}
