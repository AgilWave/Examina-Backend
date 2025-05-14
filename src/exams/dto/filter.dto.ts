import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/response-dtos/pagination.dto';

export class ExamFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  examName?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
