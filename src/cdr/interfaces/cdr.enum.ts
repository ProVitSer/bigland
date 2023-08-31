export enum CallType {
  outgoing = 'outgoing',
  incoming = 'incoming',
  pozvonim = 'pozvonim',
}

export enum MQQueue {
  cdr = 'cdr',
}

export enum MQExchange {
  presence = 'presence',
}

export enum Disposition {
  failed = 'FAILED',
  answered = 'ANSWERED',
  busy = 'BUSY',
  noAnswer = 'NO ANSWER',
}
