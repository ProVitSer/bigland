import { WebDriver } from 'selenium-webdriver';
import { Users } from '../dto/freepbx-create-users.dto';

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
