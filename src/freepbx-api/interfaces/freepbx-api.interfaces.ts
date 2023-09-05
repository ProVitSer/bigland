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

export class DeleteUsersResponse {
  @ApiProperty({ type: Boolean, description: 'Результат удаления', example: 'true' })
  delete: boolean;

  @ApiProperty({ type: [String], description: 'Массив внутренних номеров которые требуется удалить', example: '["102","103"]' })
  extensions: string[];
}

export class CreateUsersData {
  users: UsersData[];
}

export class UsersData {
  @ApiProperty({ type: String, description: 'Имя', example: 'Сергей' })
  firstName: string;

  @ApiProperty({ type: String, description: 'Фамилия', example: 'Пупкин' })
  lastName: string;

  @ApiProperty({ type: String, description: 'email на который будет отправленны авторизационные данные', example: 'email@test.ru' })
  email: string;

  @ApiProperty({ type: String, description: 'Созданный для данного пользователя добавочный номер', example: '102' })
  extension: string;
}
