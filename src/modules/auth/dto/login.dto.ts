import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

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

  @MaxLength(100)
  @IsString()
  @IsDefined()
  readonly payload: Record<string, any>;

  @MaxLength(100)
  @IsNotEmpty()
  @IsDefined()
  readonly name: string;

  @MaxLength(100)
  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  readonly email: string;
}
