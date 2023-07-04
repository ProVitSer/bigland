import { Injectable } from '@nestjs/common';
import { DefaultApplicationApiStruct } from './interfaces/bigland.interfaces';
import { ApplicationApiActionStatus } from './interfaces/bigland.enum';
import { UtilsService } from '@app/utils/utils.service';
import { distinctUntilChanged } from 'rxjs';

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

  public async subscribeApiResult<T extends { status: ApplicationApiActionStatus }>(fn: () => Promise<any>, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const subscriber = UtilsService.getObservableFn(fn, timeout)
        .pipe(
          distinctUntilChanged((prev: T, current: T) => {
            return prev.status === current.status;
          }),
        )
        .subscribe({
          next: async (res: T) => {
            switch (res.status) {
              case ApplicationApiActionStatus.completed:
                subscriber.unsubscribe();
                resolve(res);
                break;
              case ApplicationApiActionStatus.inProgress:
                break;
              case ApplicationApiActionStatus.apiFail:
                subscriber.unsubscribe();
                reject(res);
                break;
              case ApplicationApiActionStatus.cancel:
                subscriber.unsubscribe();
                break;
            }
          },
          error: (e: unknown) => {
            subscriber.unsubscribe();
            reject(e);
          },
        });
    });
  }
}
