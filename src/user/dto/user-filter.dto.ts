import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/response-dtos/pagination.dto';

export class UserFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isBlacklisted?: boolean;

  @IsOptional()
  @IsString()
  role?: string;
}
