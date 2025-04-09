import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/response-dtos/pagination.dto';

export class CourseFilterDto extends PaginationDto {
  @IsOptional()
  facultyId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  isActive?: boolean;
}
