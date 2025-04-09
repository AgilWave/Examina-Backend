import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/response-dtos/pagination.dto';

export class BatchFilterDto extends PaginationDto {
  @IsOptional()
  courseId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  isActive?: boolean;
}
