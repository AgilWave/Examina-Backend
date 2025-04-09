import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsNumber()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;

  @IsNumber()
  @IsOptional()
  facultyId?: number;

  @IsNumber()
  @IsOptional()
  batchId?: number;

  @IsNumber()
  @IsOptional()
  courseId?: number;
}

export class UpdateStudentDto {
  @IsNumber()
  @IsOptional()
  facultyId?: number;

  @IsNumber()
  @IsOptional()
  batchId?: number;

  @IsNumber()
  @IsOptional()
  courseId?: number;
}
