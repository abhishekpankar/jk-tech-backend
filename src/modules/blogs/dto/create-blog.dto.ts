import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBlogDto {
  @MaxLength(100)
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  title: string;

  @MaxLength(200)
  @IsNotEmpty()
  @IsDefined()
  about: string;

  @MaxLength(100000)
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  brief: string;
}
