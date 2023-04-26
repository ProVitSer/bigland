import { Cdr } from '../cdr.schema';

export interface CdrPubSubInfo {
  pattern: 'cdr';
  data: Cdr;
}
