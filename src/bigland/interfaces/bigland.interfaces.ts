import { ApiProperty } from '@nestjs/swagger';
import { ApplicationApiActionStatus } from './bigland.enum';

export class ApplicationId {
    @ApiProperty({
        type: String,
        description: 'Уникальный идентификатор задачи',
        example: '19760f74-a50a-4248-8fc1-44a6aa879b60'
    })
    applicationId: string;
}

export class DefaultApplicationApiStruct extends ApplicationId {
    @ApiProperty({
        enum: ApplicationApiActionStatus,
        enumName: 'ApplicationApiActionStatus',
        description: 'Статус запуска проверки',
        example: ApplicationApiActionStatus.inProgress,
        default: ApplicationApiActionStatus.inProgress,
    })
    status: ApplicationApiActionStatus;
}