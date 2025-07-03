import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../response-dtos/pagination.dto';

export class ExamFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  examName?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  batchId?: string;
}
