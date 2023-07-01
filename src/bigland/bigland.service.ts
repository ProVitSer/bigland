import { Injectable } from '@nestjs/common';
import { DefaultApplicationApiStruct } from './interfaces/bigland.interfaces';
import { ApplicationApiActionStatus } from './interfaces/bigland.enum';
import { UtilsService } from '@app/utils/utils.service';

@Injectable()
export class BiglandService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public getDefaultApiStruct(): DefaultApplicationApiStruct {
    return {
      applicationId: UtilsService.generateId(true),
      status: ApplicationApiActionStatus.inProgress,
    };
  }
}
