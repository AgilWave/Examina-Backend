import { IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLectureDto {
  @ApiProperty({
    description: 'User ID',
    type: Number,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Faculty IDs',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  facultyIds?: number[];

  @ApiProperty({
    description: 'Course IDs',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  courseIds?: number[];

  @ApiProperty({
    description: 'Created by',
    type: String,
    required: false,
  })
  @IsOptional()
  createdBy?: string;
}

export class UpdateLectureDto {
  @ApiProperty({
    description: 'Faculty IDs',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  facultyIds?: number[];

  @ApiProperty({
    description: 'Course IDs',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  courseIds?: number[];
}
