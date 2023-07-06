export enum CheckSpamStatus {
  spam = 'spam',
  normal = 'normal',
  notSureYet = 'notSureYet',
  failed = 'failed',
}

export enum SpamType {
  checkNumber = 'checkNumber',
  checkOperatorNumbers = 'checkOperatorNumbers',
  report = 'report',
  checkAllOperators = 'checkAllOperators',
}
