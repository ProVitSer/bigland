import { ChannelType } from './interfaces/asterisk.enum';

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

export const AMD_OUTBOUND_CALL = {
  endpoint: `${ChannelType.PJSIP}/992`,
  extension: '992',
  context: 'amd-outcalls',
  priority: 1,
};
