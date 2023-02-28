export const ARI_OUTBOUND_CALL_OPERATOR = 'Monitoring';
export const DEFAULT_TIMEOUT_HANDLER = 2000;
export const ARI_OUTBOUND_CALL = {
  context: 'channel-dump',
  priority: 1,
  extension: '2222',
  appArgs: 'dialed',
};

export const AMI_OUTBOUND_CALL = {
  context: 'from-internal',
  async: 'yes',
  priority: '1',
  timeout: '50000',
};

export const POZVONIM_OUTBOUND_CALL = {
  context: 'pozvonim',
  priority: 1,
};
