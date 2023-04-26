export enum AmocrmActionStatus {
  status = 'status',
  call = 'call',
  cdr = 'cdr',
}

export enum AsteriskApiActionStatus {
  apiFail = 'apiFail',
  inProgress = 'inProgress',
  completed = 'completed',
}

export enum AsteriskAmdCallStatus {
  MACHINE = 'MACHINE',
  HUMAN = 'HUMAN',
  NOTSURE = 'NOTSURE',
  HANGUP = 'HANGUP',
}

export enum AsteriskApiNumberStatus {
  spam = 'spam',
  normal = 'normal',
  notSureYet = 'notSureYet',
  failed = 'failed',
}

export enum AsteriskDialStatus {
  CHANUNAVAIL = 'CHANUNAVAIL',
  CONGESTION = 'CONGESTION',
  NOANSWER = 'NOANSWER',
  BUSY = 'BUSY',
  ANSWER = 'ANSWER',
  CANCEL = 'CANCEL',
}
