import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../response-dtos/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserFilterDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isBlacklisted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  role?: string;
}
