import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../response-dtos/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ModuleFilterDTO extends PaginationDto {
  @ApiProperty({
    description: 'Module name',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Faculty ID',
    type: Number,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  facultyId?: number;

  @ApiProperty({
    description: 'Module is active',
    type: Boolean,
  })
  @IsOptional()
  @IsString()
  isActive?: boolean;
}
