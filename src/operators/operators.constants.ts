import { OperatorsName } from './interfaces/operators.enum';

export const OPERATOR_PROJ = { _id: 0, name: 1, 'numbers.callerId': 1 };

export const OPERATOR_DEFAULT_SETTINGS: { [key in OperatorsName]?: { [key: string]: any } } = {
  [OperatorsName.mango]: {
    pbxTrunkNumber: '2',
    outSuffix: 'Mango',
    isActive: true,
  },
};
