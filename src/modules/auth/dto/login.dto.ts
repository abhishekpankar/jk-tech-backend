import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

class UserDto {
  @MaxLength(100)
  @IsNotEmpty()
  @IsDefined()
  readonly name: string;

  @MaxLength(100)
  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  readonly email: string;

  @MaxLength(100)
  @IsNotEmpty()
  @IsDefined()
  readonly id: string;

  @MaxLength(100)
  @IsNotEmpty()
  @IsDefined()
  readonly token: string;
}

export class LoginDto {
  @MaxLength(100)
  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  readonly email: string;

  @MaxLength(100)
  @IsString()
  @IsDefined()
  readonly password: string;
}

export class BrowserLoginDto {
  @MaxLength(100)
  @IsNotEmpty()
  @IsDefined()
  readonly provider: string;

  @IsDefined()
  readonly user: UserDto;
}
