import { Users } from '@app/users/users.schema';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Почта указанная при регистрации',
    nullable: false,
  })
  email: string;
  @ApiProperty({
    description: 'Имя указанное при регистрации',
    nullable: false,
  })
  username: string;
}

export interface RequestWithUser extends Request {
  user: Users;
}

export class GetApiTokenReponse {
  @ApiProperty({
    description: 'accessToken',
    nullable: false,
  })
  accessToken: string;
}
