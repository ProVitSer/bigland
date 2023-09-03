import { ApiProperty } from '@nestjs/swagger';
import { ApplicationApiActionStatus } from './bigland.enum';

export class DefaultApplicationApiStruct {
  @ApiProperty({ type: String, description: 'Уникальный идентификатор проверки', example: '90859260-dd5c-4232-bc59-8964963a061c' })
  applicationId: string;

  @ApiProperty({
    enum: ApplicationApiActionStatus,
    enumName: 'ApplicationApiActionStatus',
    description: 'Статус запуска проверки',
    example: ApplicationApiActionStatus.inProgress,
    default: ApplicationApiActionStatus.inProgress,
  })
  status: ApplicationApiActionStatus;
}
