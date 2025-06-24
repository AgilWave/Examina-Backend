import {
  IsBoolean,
  IsArray,
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateCourseDTO {
  @ApiProperty({
    description: 'Course name',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Faculty ID',
    type: Number,
  })
  @IsNumber()
  @IsInt()
  facultyId: number;

  @ApiProperty({
    description: 'Module IDs',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  moduleIds: number[];

  @ApiProperty({
    description: 'Created by',
    type: String,
  })
  @IsString()
  @IsOptional()
  createdBy?: string;
}

export class UpdateCourseDTO {
  @ApiProperty({
    description: 'Course name',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Faculty ID',
    type: Number,
  })
  @IsNumber()
  @IsInt()
  facultyId: number;

  @ApiProperty({
    description: 'Module IDs',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  moduleIds: number[];

  @ApiProperty({
    description: 'Is active',
    type: Boolean,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Updated by',
    type: String,
  })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}
