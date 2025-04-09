import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/response-dtos/pagination.dto';

export class FacultyFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  isActive?: boolean;
}
