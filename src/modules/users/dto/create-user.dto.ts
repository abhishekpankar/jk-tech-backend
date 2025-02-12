import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @MaxLength(30)
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  name: string;

  @MaxLength(80)
  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  email: string;

  @MaxLength(30)
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  password: string;

  @Max(Infinity)
  @Min(1)
  @IsPositive()
  @IsNumber()
  @IsDefined()
  roleId: number;
}
