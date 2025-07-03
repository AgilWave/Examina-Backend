import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../response-dtos/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CourseFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Course name',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Course is active',
    type: Boolean,
  })
  @IsOptional()
  @IsString()
  isActive?: boolean;

  @ApiProperty({
    description: 'Faculty ID',
    type: String,
  })
  @IsOptional()
  @IsString()
  facultyId?: string;
}
