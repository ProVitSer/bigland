import { ArrayNotEmpty, IsArray } from 'class-validator';

export class FreePBXDeleteUsersDto {
  @IsArray()
  @ArrayNotEmpty()
  extensions: string[];
}
