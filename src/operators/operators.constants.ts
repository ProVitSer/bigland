import { OperatorsName } from './interfaces/operators.enum';

export const OPERATOR_PROJ = {
    _id: 0,
    name: 1,
    'numbers.callerId': 1
};

export const OPERATOR_DEFAULT_SETTINGS: {
    [key in OperatorsName]: {
        [key: string]: any
    }
} = {
    [OperatorsName.mango]: {
        pbxTrunkNumber: '2',
        outSuffix: 'Mango',
    },
    [OperatorsName.zadarma]: {
        pbxTrunkNumber: '22',
        outSuffix: 'Zadarma-IP',
    },
    [OperatorsName.optima]: {
        pbxTrunkNumber: '4',
        outSuffix: 'Optima-XXXXXXXX',
    },
    [OperatorsName.mtt]: {
        pbxTrunkNumber: '21',
        outSuffix: 'MTT',
    },
    [OperatorsName.beeline]: {
        pbxTrunkNumber: '20',
        outSuffix: 'Beeline',
    },
};