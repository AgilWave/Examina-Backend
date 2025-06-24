import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({
    description: 'User ID',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;

  @ApiProperty({
    description: 'Faculty ID',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  facultyId?: number;

  @ApiProperty({
    description: 'Batch ID',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  batchId?: number;

  @ApiProperty({
    description: 'Course ID',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  courseId?: number;
}

export class UpdateStudentDto {
  @ApiProperty({
    description: 'Faculty ID',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  facultyId?: number;

  @ApiProperty({
    description: 'Batch ID',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  batchId?: number;

  @ApiProperty({
    description: 'Course ID',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  courseId?: number;
}
