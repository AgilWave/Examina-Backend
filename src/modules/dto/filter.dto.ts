import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/response-dtos/pagination.dto';

export class ModuleFilterDTO extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  facultyId?: number;

  @IsOptional()
  @IsString()
  isActive?: boolean;
}
