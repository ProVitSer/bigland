import { Users } from '@app/users/users.schema';
import { UsersService } from '@app/users/users.service';
import { Injectable, HttpStatus } from '@nestjs/common';
import { USER_NOT_FOUND, INVALALID_CREDENTIALS } from '../auth.constants';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponse } from '../interfaces/auth.interfaces';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthUserService {
  constructor(private readonly usersService: UsersService) {}

  public async register(registrationData: RegisterDto): Promise<RegisterResponse> {
    const { username, email, password } = registrationData;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const checkUser = await this.usersService.getByEmail(email.toLowerCase());
      if (checkUser)
        throw {
          message: `Пользователь с почтой  ${email} уже зарегистрирован`,
          httpStatus: HttpStatus.BAD_REQUEST,
        };

      await this.usersService.create({
        username,
        email: email.toLowerCase(),
        passHash: hashedPassword,
      });

      return {
        email,
        username,
      };
    } catch (e) {
      throw e;
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string): Promise<Users> {
    try {
      const user = await this.usersService.getByEmail(email);
      if (user == null) {
        throw USER_NOT_FOUND;
      }
      await this.verifyPassword(plainTextPassword, user.passHash);
      user.passHash = undefined;
      return user;
    } catch (e) {
      throw e;
    }
  }

  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatching) {
      throw INVALALID_CREDENTIALS;
    }
  }

  public async validateUser(userId: string) {
    return await this.usersService.getActiveUserById(userId);
  }
}
