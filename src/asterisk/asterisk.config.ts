export const ARIOUTBOUNDCALLOPERATOR = 'Monitoring';
export const DEFAULT_TIMEOUT_HANDLER = 2000;
export const ARIOUTBOUNDCALL = {
  context: 'channel-dump',
  priority: 1,
  extension: '2222',
  appArgs: 'dialed',
};

export const AMIOUTBOUNDCALL = {
  context: 'from-internal',
  async: 'yes',
  priority: '1',
  timeout: '50000',
};

export const POZVONIMOUTBOUNDCALL = {
  context: 'pozvonim',
  priority: 1,
};
