import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../response-dtos/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FacultyFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Faculty name',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Faculty is active',
    type: Boolean,
  })
  @IsOptional()
  @IsString()
  isActive?: boolean;
}
