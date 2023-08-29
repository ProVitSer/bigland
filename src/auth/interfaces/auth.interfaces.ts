import { Users } from '@app/users/users.schema';
import { Request } from 'express';

export type JwtPayload = {
  userId: string;
};

export type Tokens = {
  token: string;
};

export interface TokenPayload {
  userId: string;
}

export class RegisterResponse {
  email: string;
  username: string;
}

export interface RequestWithUser extends Request {
  user: Users;
}

export class GetApiTokenReponse {
  accessToken: string;
}
