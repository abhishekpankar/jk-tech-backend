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
