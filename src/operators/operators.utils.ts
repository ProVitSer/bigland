import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { OperatorFormatNumber } from './interfaces/operators.enum';
import { FormatOperatorNumber } from './interfaces/operators.interfaces';
import { Operators } from './operators.schema';

export class OperatorsUtils {
  static formatOperatorNumber(operator: Operators, dstNumber: string, callerId: string): FormatOperatorNumber {
    const dst = UtilsService.normalizePhoneNumber(dstNumber);
    const cid = UtilsService.normalizePhoneNumber(callerId);
    switch (operator.formatNumber) {
      case OperatorFormatNumber.tenDigits:
        return {
          dstNumber: dst.slice(1),
          callerId: cid.slice(1),
        };
      case OperatorFormatNumber.theFirstEight:
        return {
          dstNumber: `8${dst.slice(1)}`,
          callerId: `8${cid.slice(1)}`,
        };
      case OperatorFormatNumber.theFirstSeven:
        return {
          dstNumber: dst,
          callerId: cid,
        };
    }
  }
}
