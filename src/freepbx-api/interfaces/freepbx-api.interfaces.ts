import { CreateUsersDto } from '../dto/create-users.dto';
import { FreepbxApiStatus } from './freepbx-api.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ResultCreateUsers {
  @ApiProperty({
    description: 'Уникальный идентификатор задание по созданию пользователей',
    nullable: false,
  })
  apiId: string;
}

export interface CreateFreepbxUser extends CreateUsersDto, ResultCreateUsers {}

export interface UpdateCreateUser {
  status: FreepbxApiStatus;
  message?: string;
  [key: string]: any;
}

export interface CreateUserResult {
  extension: string;
  password: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SetGeneralSetting extends CreateUserResult {}
