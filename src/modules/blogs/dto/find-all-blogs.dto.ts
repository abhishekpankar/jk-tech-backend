import { Transform } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class FindAllBlogsDto {
  @Max(Infinity)
  @Min(1)
  @IsNumber()
  @Transform(({ value }) => {
    return Number(value);
  })
  page = 1;
}
