import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../response-dtos/pagination.dto';

export class QuestionFilterDTO extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  moduleId?: number;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
