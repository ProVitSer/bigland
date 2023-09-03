import { WebDriver } from 'selenium-webdriver';
import { Users } from '../dto/freepbx-create-users.dto';
import { ApiProperty } from '@nestjs/swagger';

export interface CreateUserResult {
  extension: string;
  password: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SetGeneralSetting extends CreateUserResult {}

export interface CreatePbxUserData extends Omit<Users, 'email'> {
  extension: string;
  webDriver: WebDriver;
}

export class CreateUsersResponse {
  @ApiProperty({ type: Boolean, description: 'Запустился ли процесс создание добавочных или нет', example: 'true' })
  createStart: boolean;
}

export class DeleteUsersResponse {
  @ApiProperty({ type: Boolean, description: 'Результат удаления', example: 'true' })
  delete: boolean;
}
